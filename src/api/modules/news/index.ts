import http from '@/api';
import type { AddNewsReq } from '@/api/interface/news/news';
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
 * 新增资讯
 * @param data
 * @returns {*}
 */
export const addNews = (data: AddNewsReq) => {
  return http.post(ADMIN_MODULE + `/news/add`, data);
};

/**
 * 更新资讯
 * @param id
 * @param data
 * @returns {*}
 */
export const updateNews = (id: number, data: AddNewsReq) => {
  return http.put(ADMIN_MODULE + `/news/update?id=${id}`, data);
};

/**
 * 获取资讯列表
 * @param params
 * @returns {*}
 */
export const getNewsList = (params: any) => {
  return http.get<IPage<any>>(ADMIN_MODULE + `/news/list`, params);
};

/**
 * 获取资讯详情
 * @param id
 * @returns {*}
 */
export const getNewsDetail = (id: number) => {
  return http.get(ADMIN_MODULE + `/news/detail`, { id });
};

/**
 * 删除资讯
 * @param id
 * @returns {*}
 */
export const deleteNews = (id: number) => {
  return http.delete(ADMIN_MODULE + `/news/delete`, { id });
};
