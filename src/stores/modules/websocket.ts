// src/stores/modules/websocket.ts
import { defineStore } from 'pinia';
import { ElNotification } from 'element-plus';

export const useWebsocketStore = defineStore('websocket', {
  state: () => ({
    notifications: [] as any[],
    todos: [] as any[],
    messages: [] as any[],
    isConnected: false,
    websocket: null as WebSocket | null,
    
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
      this.connectWebSocket();
    },
    
    connectWebSocket() {
      // 如果已存在连接，先关闭
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }
      
      try {
        const userStr = localStorage.getItem('user') || '{}';
        const user = JSON.parse(userStr);
        const token = user.token || '';
        
        const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws';
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
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('WebSocket连接已建立');
      
      // 发送认证消息
      const userStr = localStorage.getItem('user') || '{}';
      const user = JSON.parse(userStr);
      const token = user.token || '';
      this.sendMessage({ type: 'auth', token });
      
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
    },
    
    onClose(event: CloseEvent) {
      this.isConnected = false;
      console.log('WebSocket连接已关闭, 代码:', event.code, '原因:', event.reason);
      
      // 停止心跳
      this.stopHeartbeat();
      
      // 如果不是正常关闭，尝试重连
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    },
    
    handleMessage(data: any) {
      switch (data.type) {
        case 'system_notice':
          this.notifications.push(data.content);
          ElNotification({
            title: '系统通知',
            message: data.content,
            type: 'success',
            duration: 3000
          });
          break;
          
        case 'order_created':
          ElNotification({
            title: '下单通知',
            message: data.content,
            type: 'success',
            duration: 2000
          });
          break;
          
        case 'todo':
          this.todos.push(data.content);
          break;
          
        case 'message':
          this.messages.push(data.content);
          break;
          
        default:
          console.log('未处理的消息类型:', data.type, data);
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
          console.log('发送心跳');
          this.websocket.send(this.heartbeatMessage);
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
      }, this.reconnectInterval);
    },
    
    // 主动断开连接
    disconnect() {
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
    }
  }
});