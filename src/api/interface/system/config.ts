import type { IPageQuery } from '@/api/interface';

export namespace IConfig {
  export interface Query extends IPageQuery {
    seach?: string;
    configKey?: string;
  }

  export interface Form {
    id?: number;
    configName: string;
    configKey: string;
    configValue: string;
    remark: string;
  }

  export interface Info {
    id: number;
    configName: string;
    configKey: string;
    configValue: string;
    remark: string;
    createId: number;
    createTime: string;
    updateId: number;
    updateTime: string;
    isLock?: string;
  }
}

export interface SystemInfo {
  id?: number
  system_name: string
  system_title: string
  icp_number?: string
  copyright?: string
  status: 0 | 1
  create_time?: string
  update_time?: string
}

export interface SystemInfoReq extends SystemInfo {}

export interface UpdateSystemInfoReq extends SystemInfo {
  id: number
}

export interface SystemInfoListResult {
  items: SystemInfo[]
  total: number
  page: number
  page_size: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  originUrl?: string
}
