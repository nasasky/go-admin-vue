// 店铺信息相关API接口定义
export namespace IStore {
  // 店铺信息数据结构
  export interface Info {
    id?: number;
    storeName: string;       // 店铺名称
    manager: string;         // 店铺负责人
    phone: string;          // 联系手机号
    address: string;        // 店铺位置
    businessHours: string[]; // 营业时间 [开始时间, 结束时间]
    logo: string;           // 店铺Logo URL
    description?: string;    // 店铺介绍
    status?: number;        // 状态：1-正常 0-禁用
    createTime?: string;    // 创建时间
    updateTime?: string;    // 更新时间
  }

  // 保存店铺信息请求参数
  export interface SaveParams {
    storeName: string;
    manager: string;
    phone: string;
    address: string;
    businessHours: string[];
    logo: string;
    description?: string;
  }

  // API响应数据
  export interface Response {
    code: number;
    message: string;
    data: Info;
  }
}
