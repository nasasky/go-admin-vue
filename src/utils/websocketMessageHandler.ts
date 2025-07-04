import { ElNotification } from 'element-plus';
import type { WebSocketMessage, SystemNoticeMessage, OrderNoticeMessage, UserNoticeMessage } from '@/types/websocket';

// 消息处理配置
interface MessageHandlerConfig {
  showNotifications?: boolean;
  notificationDuration?: number;
  enableSound?: boolean;
}

// 默认配置
const defaultConfig: MessageHandlerConfig = {
  showNotifications: true,
  notificationDuration: 3000,
  enableSound: false
};

// 消息类型处理器映射
const messageHandlers = {
  // system_notice: (message: SystemNoticeMessage, config: MessageHandlerConfig) => {
  //   if (config.showNotifications) {
  //     ElNotification({
  //       title: '系统通知',
  //       message: message.content,
  //       type: 'success',
  //       duration: config.notificationDuration,
  //       position: 'top-right'
  //     });
  //   }
  //   return { type: 'notification', data: message };
  // },
  
  order_created: (message: OrderNoticeMessage, config: MessageHandlerConfig) => {
    if (config.showNotifications) {
      ElNotification({
        title: '订单通知',
        message: message.content,
        type: 'success',
        duration: config.notificationDuration,
        position: 'top-right'
      });
    }
    return { type: 'order', data: message };
  },
  
  order_updated: (message: OrderNoticeMessage, config: MessageHandlerConfig) => {
    if (config.showNotifications) {
      ElNotification({
        title: '订单更新',
        message: message.content,
        type: 'warning',
        duration: config.notificationDuration,
        position: 'top-right'
      });
    }
    return { type: 'order', data: message };
  },
  
  order_cancelled: (message: OrderNoticeMessage, config: MessageHandlerConfig) => {
    if (config.showNotifications) {
      ElNotification({
        title: '订单取消',
        message: message.content,
        type: 'error',
        duration: config.notificationDuration,
        position: 'top-right'
      });
    }
    return { type: 'order', data: message };
  },
  
  user_notice: (message: UserNoticeMessage, config: MessageHandlerConfig) => {
    if (config.showNotifications) {
      ElNotification({
        title: '用户通知',
        message: message.content,
        type: 'info',
        duration: config.notificationDuration,
        position: 'top-right'
      });
    }
    return { type: 'user', data: message };
  }
};

/**
 * 处理WebSocket消息
 * @param message 消息对象
 * @param config 处理配置
 * @returns 处理结果
 */
export function handleWebSocketMessage(message: WebSocketMessage, config: MessageHandlerConfig = defaultConfig) {
  const handler = messageHandlers[message.type as keyof typeof messageHandlers];
  
  if (handler) {
    return handler(message as any, config);
  }
  
  // 默认处理
  console.log('未处理的消息类型:', message.type, message);
  return { type: 'unknown', data: message };
}

/**
 * 创建消息确认对象
 * @param messageId 消息ID
 * @param type 确认类型
 * @returns 确认消息对象
 */
export function createMessageConfirmation(messageId: string, type: 'message_received' | 'message_read' | 'message_confirmed') {
  return {
    type,
    message_id: messageId,
    timestamp: Date.now()
  };
}

/**
 * 验证消息格式
 * @param message 消息对象
 * @returns 是否有效
 */
export function validateMessage(message: any): message is WebSocketMessage {
  return message && typeof message === 'object' && typeof message.type === 'string';
}

/**
 * 获取消息优先级
 * @param message 消息对象
 * @returns 优先级
 */
export function getMessagePriority(message: WebSocketMessage): 'low' | 'medium' | 'high' {
  if ('priority' in message && message.priority) {
    return message.priority as 'low' | 'medium' | 'high';
  }
  
  // 根据消息类型判断优先级
  switch (message.type) {
    case 'system_notice':
      return 'high';
    case 'order_cancelled':
      return 'high';
    case 'order_created':
    case 'order_updated':
      return 'medium';
    default:
      return 'low';
  }
} 