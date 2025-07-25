import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IStore } from '@/api/interface/system/store';

/**
 * 获取店铺列表
 * @param params
 * @returns {*}
 */
export const getStoreList = (params: IStore.Query) => {
  return http.get<IPage<IStore.Info>>(ADMIN_MODULE + `/store`, params);
};

/**
 * 获取店铺详情
 * @param params
 * @returns {*}
 */
export const getStoreDetail = (params: { id: number }) => {
  return http.get<IStore.Info>(ADMIN_MODULE + `/store/detail`, params);
};

/**
 * 新增店铺
 * @param params
 * @returns {*}
 */
export const addStore = (params: IStore.Form) => {
  return http.post(ADMIN_MODULE + `/store`, params);
};

/**
 * 更新店铺信息
 * @param params
 * @returns {*}
 */
export const updateStore = (params: IStore.Form) => {
  return http.put(ADMIN_MODULE + `/store`, params);
};

/**
 * 删除店铺
 * @param id
 * @returns {*}
 */
export const deleteStore = (id: number) => {
  return http.delete(ADMIN_MODULE + `/store/${id}`);
};

/**
 * 更新店铺状态
 * @param params
 * @returns {*}
 */
export const updateStoreStatus = (params: IStore.StatusParams) => {
  return http.put(ADMIN_MODULE + `/store/${params.id}/status`, { status: params.status });
}; 