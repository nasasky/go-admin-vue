import type { IPageQuery } from '@/api/interface';

export namespace IBanner {
  // 查询条件
  export interface Query extends IPageQuery {
    title?: string;
    status?: number;
  }

  // 轮播图信息
  export interface Info {
    id: number;
    title: string;
    image_url: string;
    link_url: string;
    sort: number;
    status: number;
    create_time?: string;
    update_time?: string;
  }

  // 创建/编辑表单
  export interface Form {
    id?: number;
    title: string;
    image_url: string;
    link_url: string;
    sort: number;
    status: number;
  }
} 