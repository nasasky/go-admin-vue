// 店铺信息管理模块
import type { IPageQuery } from '@/api/interface';

export namespace IStore {
  export interface Query extends IPageQuery {
    store_name?: string;
    manager?: string;
    phone?: string;
    address?: string;
    status?: number;
    search?: string;
  }

  export interface Form {
    id?: number;
    store_name: string;
    manager: string;
    manager_id: number;
    phone: string;
    address: string;
    business_hours?: BusinessHours[];
    logo?: string;
    description?: string;
    status: number;
  }

  export interface Info {
    id?: number;
    store_name: string;
    manager: string;
    manager_id: number;
    phone: string;
    address: string;
    business_hours?: string;
    logo?: string;
    description?: string;
    status: number;
    create_time?: string;
    update_time?: string;
  }

  export interface BusinessHours {
    day: string;
    start_time: string;
    end_time: string;
    is_open: boolean;
  }

  export interface StatusParams {
    id: number;
    status: number;
  }
} 