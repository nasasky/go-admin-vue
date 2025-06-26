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
