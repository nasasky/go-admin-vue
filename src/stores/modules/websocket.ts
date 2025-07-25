// src/stores/modules/websocket.ts
import { defineStore } from 'pinia';
import { useUserStore } from '@/stores/modules/user';
import { handleWebSocketMessage, createMessageConfirmation, validateMessage } from '@/utils/websocketMessageHandler';

export const useWebsocketStore = defineStore('websocket', {
  state: () => ({
    notifications: [] as any[],
    todos: [] as any[],
    messages: [] as any[],
    isConnected: false,
    websocket: null as WebSocket | null,
    
    // 消息状态跟踪
    messageStatus: new Map<string, {
      received: boolean;
      read: boolean;
      confirmed: boolean;
      timestamp: number;
    }>(),
    
    // 心跳相关配置
    heartbeatTimer: null as number | null,
    heartbeatInterval: 30000, // 30秒发送一次心跳
    heartbeatMessage: JSON.stringify({ type: 'ping' }),
    
    // 重连相关配置
    reconnectTimer: null as number | null,
    reconnectInterval: 5000, // 重连间隔5秒
    reconnectAttempts: 0,
    maxReconnectAttempts: 5, // 最大重连次数
  }),
  
  actions: {
    initWebSocket() {
      // 如果已经连接，不需要重新初始化
      if (this.isConnected && this.websocket?.readyState === WebSocket.OPEN) {
        console.log('WebSocket已连接，跳过初始化');
        return;
      }

      // 如果有正在进行的连接，先断开
      if (this.websocket) {
        console.log('断开现有WebSocket连接');
        this.disconnect();
      }

      console.log('开始初始化WebSocket连接');
      this.connectWebSocket();
    },
    
    connectWebSocket() {
      try {
        const userStore = useUserStore();
        const token = userStore.token;
        
        if (!token) {
          console.warn('WebSocket连接失败: 未找到token');
          return;
        }
        
        // 获取配置的WebSocket URL
        let wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws';
        
        // 确保在HTTPS页面上使用WSS协议
        if (window.location.protocol === 'https:' && wsUrl.startsWith('ws:')) {
          wsUrl = wsUrl.replace('ws:', 'wss:');
          console.log('检测到HTTPS环境，已将WebSocket协议更改为WSS');
        }
        
        console.log('正在连接WebSocket:', wsUrl);
        
        this.websocket = new WebSocket(`${wsUrl}?token=${token}`);
        
        this.websocket.onopen = this.onOpen.bind(this);
        this.websocket.onmessage = this.onMessage.bind(this);
        this.websocket.onerror = this.onError.bind(this);
        this.websocket.onclose = this.onClose.bind(this);
      } catch (error) {
        console.error('WebSocket连接创建失败:', error);
        this.scheduleReconnect();
      }
    },
    
    onOpen() {
      // console.log('WebSocket连接已建立 - 连接ID:', this.websocket?.url);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // 开始心跳
      this.startHeartbeat();
    },
    
    onMessage(event: MessageEvent) {
      try {
        const data = JSON.parse(event.data);
        
        // 处理心跳响应
        if (data.type === 'pong') {
          console.log('收到心跳响应');
          return;
        }
        
        this.handleMessage(data);
      } catch (e) {
        console.error('解析WebSocket消息失败:', e);
      }
    },
    
    onError(event: Event) {
      console.error('WebSocket错误:', event);
      this.isConnected = false;
    },
    
    onClose(event: CloseEvent) {
      console.log(event.code)
      this.isConnected = false;
      
      // 解析关闭原因
      let closeReason = '未知原因';
      switch (event.code) {
        case 1000:
          closeReason = '正常关闭';
          break;
        case 1001:
          closeReason = '终端离开，可能是服务器关闭或浏览器导航离开页面';
          break;
        case 1002:
          closeReason = '协议错误';
          break;
        case 1003:
          closeReason = '收到不能处理的数据类型';
          break;
        case 1005:
          closeReason = '没有收到预期的状态码，可能是服务器异常关闭或网络问题';
          break;
        case 1006:
          closeReason = '异常关闭，可能是网络问题或服务器崩溃';
          break;
        case 1007:
          closeReason = '收到的数据格式不一致';
          break;
        case 1008:
          closeReason = '收到违反策略的数据';
          break;
        case 1009:
          closeReason = '收到太大的数据包';
          break;
        case 1010:
          closeReason = '客户端请求的扩展服务器不支持';
          break;
        case 1011:
          closeReason = '服务器遇到异常';
          break;
        case 1015:
          closeReason = 'TLS握手失败';
          break;
        case 4000:
          closeReason = '身份验证失败或Token过期';
          break;
        case 4001:
          closeReason = '未授权的连接';
          break;
        case 4002:
          closeReason = '服务器内部错误';
          break;
      }

      console.log(`WebSocket连接已关闭:
        状态码: ${event.code}
        原因: ${closeReason}
        服务器消息: ${event.reason || '无'}
        是否正常关闭: ${event.wasClean ? '是' : '否'}
      `);

      // 停止心跳
      this.stopHeartbeat();
      
      // 根据关闭原因决定是否重连
      if (event.code === 1000) {
        // 正常关闭，不重连
        return;
      } else if (event.code === 4000 || event.code === 4001) {
        // 认证问题，尝试重新获取token
        const userStore = useUserStore();
        if (userStore.token) {
          console.log('检测到认证问题，将在5秒后尝试重新连接...');
          this.scheduleReconnect();
        } else {
          console.log('未找到有效token，取消重连');
        }
      } else if (event.code === 1005 || event.code === 1006) {
        // 网络问题或异常关闭，使用递增延迟重试
        console.log('检测到网络问题或异常关闭，将使用递增延迟重试...');
        this.scheduleReconnect();
      } else {
        // 其他情况，尝试重连
        console.log('未知错误，将尝试重连...');
        this.scheduleReconnect();
      }
    },
    
    handleMessage(data: any) {
      console.log('收到消息:', data);
      
      // 验证消息格式
      if (!validateMessage(data)) {
        console.error('无效的消息格式:', data);
        return;
      }
      
      // 处理消息接收确认
      if (data.message_id) {
        this.trackMessageStatus(data.message_id, 'received');
        this.sendMessageReceived(data.message_id);
      }
      
      // 使用统一的消息处理器
      const result = handleWebSocketMessage(data);
      
      // 根据处理结果更新状态
      switch (result.type) {
        case 'notification':
          this.notifications.push(result.data);
          break;
        case 'order':
          // 订单相关消息可以添加到特定列表
          break;
        case 'user':
          this.messages.push(result.data);
          break;
        case 'unknown':
          // 未知消息类型，保持原有处理逻辑
          switch (data.type) {
            case 'todo':
              this.todos.push(data.content);
              break;
            default:
              console.log('未处理的消息类型:', data.type, data);
          }
          break;
      }
    },
    
    // 跟踪消息状态
    trackMessageStatus(messageId: string, status: 'received' | 'read' | 'confirmed') {
      const currentStatus = this.messageStatus.get(messageId) || {
        received: false,
        read: false,
        confirmed: false,
        timestamp: Date.now()
      };
      
      currentStatus[status] = true;
      if (status === 'received') {
        currentStatus.timestamp = Date.now();
      }
      
      this.messageStatus.set(messageId, currentStatus);
      console.log(`消息状态更新: ${messageId} - ${status}`);
    },
    
    // 发送消息接收确认
    sendMessageReceived(messageId: string) {
      const confirmMessage = createMessageConfirmation(messageId, 'message_received');
      const success = this.sendMessage(confirmMessage);
      if (success) {
        console.log(`已发送消息接收确认: ${messageId}`);
      } else {
        console.warn(`发送消息接收确认失败: ${messageId}`);
      }
    },
    
    // 发送消息已读确认
    sendMessageRead(messageId: string) {
      const confirmMessage = createMessageConfirmation(messageId, 'message_read');
      const success = this.sendMessage(confirmMessage);
      if (success) {
        this.trackMessageStatus(messageId, 'read');
        console.log(`已发送消息已读确认: ${messageId}`);
      } else {
        console.warn(`发送消息已读确认失败: ${messageId}`);
      }
    },
    
    // 发送消息确认（用户操作确认）
    sendMessageConfirmed(messageId: string) {
      const confirmMessage = createMessageConfirmation(messageId, 'message_confirmed');
      const success = this.sendMessage(confirmMessage);
      if (success) {
        this.trackMessageStatus(messageId, 'confirmed');
        console.log(`已发送消息确认: ${messageId}`);
      } else {
        console.warn(`发送消息确认失败: ${messageId}`);
      }
    },
    
    // 发送消息
    sendMessage(data: any) {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.websocket.send(message);
        return true;
      }
      console.warn('WebSocket未连接，无法发送消息');
      return false;
    },
    
    // 开始心跳
    startHeartbeat() {
      this.stopHeartbeat();
      this.heartbeatTimer = window.setInterval(() => {
        if (this.websocket?.readyState === WebSocket.OPEN) {
          this.sendMessage(this.heartbeatMessage);
        } else {
          this.stopHeartbeat();
        }
      }, this.heartbeatInterval);
    },
    
    // 停止心跳
    stopHeartbeat() {
      if (this.heartbeatTimer !== null) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
    },
    
    // 安排重连
    scheduleReconnect() {
      // 清除之前的重连定时器
      if (this.reconnectTimer !== null) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // 检查是否超过最大重连次数
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log(`已达到最大重连次数(${this.maxReconnectAttempts})，不再重连`);
        return;
      }
      
      // 设置重连定时器
      this.reconnectTimer = window.setTimeout(() => {
        console.log(`尝试重连 (${++this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connectWebSocket();
      }, this.reconnectInterval * Math.min(this.reconnectAttempts + 1, 5)); // 使用指数退避策略
    },
    
    // 主动断开连接
    disconnect() {
      console.log('正在断开WebSocket连接');
      
      // 停止心跳
      this.stopHeartbeat();
      
      // 取消重连
      if (this.reconnectTimer !== null) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // 关闭WebSocket连接
      if (this.websocket) {
        // 设置正常关闭代码，避免触发重连
        this.websocket.close(1000, '用户主动断开');
        this.websocket = null;
      }
      
      this.isConnected = false;
      console.log('WebSocket连接已断开');
    },
    
    // 清除通知
    clearNotifications() {
      this.notifications = [];
    },
    
    // 清除待办
    clearTodos() {
      this.todos = [];
    },
    
    // 清除消息
    clearMessages() {
      this.messages = [];
    },
    
    // 获取消息状态
    getMessageStatus(messageId: string) {
      return this.messageStatus.get(messageId);
    },
    
    // 清除消息状态
    clearMessageStatus(messageId?: string) {
      if (messageId) {
        this.messageStatus.delete(messageId);
      } else {
        this.messageStatus.clear();
      }
    },
    
    // 获取所有消息状态
    getAllMessageStatus() {
      return Array.from(this.messageStatus.entries()).map(([id, status]) => ({
        messageId: id,
        ...status
      }));
    }
  }
});