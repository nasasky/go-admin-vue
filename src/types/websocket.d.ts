// WebSocket消息类型定义

export interface WebSocketMessage {
  type: string;
  message_id?: string;
  content?: string;
  data?: any;
  timestamp?: number;
}

// 消息确认类型
export interface MessageConfirmation {
  type: 'message_received' | 'message_read' | 'message_confirmed';
  message_id: string;
  timestamp?: number;
}

// 消息状态
export interface MessageStatus {
  received: boolean;
  read: boolean;
  confirmed: boolean;
  timestamp: number;
}

// 系统通知消息
export interface SystemNoticeMessage extends WebSocketMessage {
  type: 'system_notice';
  content: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

// 订单通知消息
export interface OrderNoticeMessage extends WebSocketMessage {
  type: 'order_created' | 'order_updated' | 'order_cancelled';
  content: string;
  order_id?: string;
  order_status?: string;
}

// 用户通知消息
export interface UserNoticeMessage extends WebSocketMessage {
  type: 'user_notice';
  content: string;
  user_id?: string;
  action?: string;
}

// 心跳消息
export interface HeartbeatMessage {
  type: 'ping' | 'pong';
}

// WebSocket连接状态
export interface WebSocketState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastError?: string;
  connectionTime?: number;
} 