import type { IPageQuery } from '@/api/interface';

// 查询条件
export interface IUserNotificationQuery extends IPageQuery {
  message_id?: string;
  content?: string;
  message_type?: string;
  sender_name?: string;
  status?: string;
  success?: boolean;
  priority?: number;
  need_confirm?: boolean;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: string;
}

// 管理员用户接收记录数据结构
export interface IUserNotificationRow {
  id?: string;
  message_id?: string;
  content?: string;
  message_type?: string;
  sender_id?: number;
  sender_name?: string;
  status?: string;
  success?: boolean;
  delivered_count?: number;
  failed_count?: number;
  total_count?: number;
  priority?: number;
  need_confirm?: boolean;
  push_time?: string;
  created_at?: string;
  updated_at?: string;
}

// API响应结构
export interface IUserNotificationResponse {
  record: IUserNotificationRow;
} 