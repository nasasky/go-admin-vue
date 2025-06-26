import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IBanner } from '@/api/interface/product/banner';

/**
 * 获取轮播图列表
 * @param params
 * @returns {*}
 */
export const getBannerList = (params: IBanner.Query) => {
  return http.get<IPage<IBanner.Info>>(ADMIN_MODULE + `/banner/list`, params);
};

/**
 * 创建轮播图
 * @param params
 * @returns {*}
 */
export const createBanner = (params: IBanner.Form) => {
  return http.post(ADMIN_MODULE + `/banner/add`, params);
};

/**
 * 更新轮播图
 * @param params
 * @returns {*}
 */
export const updateBanner = (params: IBanner.Form) => {
  return http.put(ADMIN_MODULE + `/banner/update`, params);
};

/**
 * 删除轮播图
 * @param params
 * @returns {*}
 */
export const deleteBanner = (params: { ids: number[] }) => {
  // 由于后端接口是单个删除，这里需要处理一下批量删除的情况
  if (params.ids.length === 1) {
    return http.delete(ADMIN_MODULE + `/banner/delete/${params.ids[0]}`);
  } else {
    // 如果是批量删除，需要发送多个请求
    return Promise.all(params.ids.map(id => http.delete(ADMIN_MODULE + `/banner/delete/${id}`)));
  }
};

/**
 * 获取轮播图详情
 * @param params
 * @returns {*}
 */
export const getBannerDetail = (params: { id: number }) => {
  return http.get<IBanner.Info>(ADMIN_MODULE + `/banner/detail/${params.id}`);
}; 