import http from '@/api';
import type { IStore } from '@/api/interface/catMall/store';

/**
 * @name 店铺信息管理
 */

// 获取店铺信息
export const getStoreInfo = () => {
  return http.get<IStore.Info>('/store/info');
};

// 保存店铺信息
export const saveStoreInfo = (params: IStore.SaveParams) => {
  return http.post<IStore.Response>('/store/info', params);
};

// 更新店铺信息
export const updateStoreInfo = (params: IStore.SaveParams) => {
  return http.put<IStore.Response>('/store/info', params);
};
