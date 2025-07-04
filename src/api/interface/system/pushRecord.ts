import type { IPageQuery } from '@/api/interface';

// 查询条件
export interface IPushRecordQuery extends IPageQuery {
  message_type?: string;
  target?: string;
  status?: string;
  sender_name?: string;
  push_time?: string[];
  createTimeStart?: string;
  createTimeEnd?: string;
}

// list或detail返回结构
export interface IPushRecordRow {
  id?: string;
  message_id?: string;
  content?: string;
  message_type?: string;
  target?: string;
  recipients_count?: string;
  status?: string;
  success?: boolean;
  push_time?: string;
  sender_id?: number;
  sender_name?: string;
}

// API响应结构
export interface IPushRecordResponse {
  record: IPushRecordRow;
} 