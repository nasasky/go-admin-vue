// src/hooks/useWebSocket.ts
import { ref, onMounted, onUnmounted } from 'vue';

interface WebSocketOptions {
  url: string;              // WebSocket连接地址
  reconnectInterval?: number; // 重连间隔 (毫秒)
  reconnectAttempts?: number; // 最大重连次数
  heartbeatInterval?: number; // 心跳间隔 (毫秒)
  heartbeatMessage?: string;  // 心跳消息内容
  onOpen?: (event: Event) => void;       // 连接建立回调
  onMessage?: (event: MessageEvent) => void; // 消息接收回调
  onError?: (event: Event) => void;      // 错误回调
  onClose?: (event: CloseEvent) => void; // 连接关闭回调
}

export function useWebSocket(options: WebSocketOptions) {
  const {
    url,
    reconnectInterval = 5000,
    reconnectAttempts = 5,
    heartbeatInterval = 30000,
    heartbeatMessage = 'ping',
    onOpen,
    onMessage,
    onError,
    onClose
  } = options;

  const socket = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const reconnectCount = ref(0);
  let heartbeatTimer: number | null = null;
  let reconnectTimer: number | null = null;

  // 创建WebSocket连接
  const connect = () => {
    if (socket.value?.readyState === WebSocket.OPEN) return;
    
    // 创建新连接
    socket.value = new WebSocket(url);
    
    // 监听连接打开事件
    socket.value.onopen = (event: Event) => {
      isConnected.value = true;
      reconnectCount.value = 0;
      startHeartbeat();
      if (onOpen) onOpen(event);
    };
    
    // 监听消息事件
    socket.value.onmessage = (event: MessageEvent) => {
      // 如果是心跳响应，不触发消息回调
      if (event.data === 'pong') return;
      
      if (onMessage) onMessage(event);
    };
    
    // 监听错误事件
    socket.value.onerror = (event: Event) => {
      if (onError) onError(event);
    };
    
    // 监听连接关闭事件
    socket.value.onclose = (event: CloseEvent) => {
      isConnected.value = false;
      stopHeartbeat();
      
      // 尝试重连
      if (reconnectCount.value < reconnectAttempts) {
        reconnectTimer = window.setTimeout(() => {
          reconnectCount.value++;
          connect();
        }, reconnectInterval);
      }
      
      if (onClose) onClose(event);
    };
  };
  
  // 发送消息
  const sendMessage = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(data);
      return true;
    }
    return false;
  };
  
  // 开始心跳检测
  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer = window.setInterval(() => {
      sendMessage(heartbeatMessage);
    }, heartbeatInterval);
  };
  
  // 停止心跳检测
  const stopHeartbeat = () => {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };
  
  // 手动关闭连接
  const disconnect = () => {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
    
    stopHeartbeat();
    
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    isConnected.value = false;
  };
  
  // 组件挂载时自动连接
  onMounted(() => {
    connect();
  });
  
  // 组件卸载时断开连接
  onUnmounted(() => {
    disconnect();
  });
  
  return {
    socket,
    isConnected,
    connect,
    disconnect,
    sendMessage
  };
}