import type { IPageQuery } from '@/api/interface';

// 查询条件
export interface ISysFileQuery extends IPageQuery {
  filename?: string;
  dirTag?: string;
  objectName?: string;
  keyword?: string;
  username?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
  method?: string;
  status_code?: number;
  client_ip?: string;
  path?: string;
  // 兼容原有的时间范围参数
  createTimeStart?: string;
  createTimeEnd?: string;
}

// 编辑form表单
export interface ISysFileForm {}

// list或detail返回结构
export interface ISysFileRow {
  id?: number;
  filename?: string;
  dirTag?: string;
  size?: number;
  url?: string;
  objectName?: string;
  contextType?: string;
  eTag?: string;
  fileId?: number;
  // 新增的API日志相关字段
  path?: string;
  request_params?: string;
  status_code?: number;
  response_code?: number;
  response_message?: string;
  response_body?: string;
  client_ip?: string;
  timestamp?: string;
  username?: string;
  method?: string;
}
