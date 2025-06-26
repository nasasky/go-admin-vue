import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { ITeacherStatistics } from '@/api/interface/product/productList';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getproductListApi = (params: ITeacherStatistics.Query) => {
  return http.get<IPage<ITeacherStatistics.Row>>(ADMIN_MODULE + `/goods/list`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const createproductApi = (params: ITeacherStatistics.Form) => {
  return http.post(ADMIN_MODULE + `/goods/add`, params);
};


/**
 * 修改
 * @param params
 * @returns {*}
 */
export const updateGoodsApi = (params: ITeacherStatistics.Form) => {
  return http.put(ADMIN_MODULE + `/goods/update`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const removeApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/goods/delete`, params);
};

/**
 * 获取详情
 * @param params
 * @returns {*}
 */
export const getDetailApi = (params: { id: number }) => {
  const { id } = params;
  return http.get<ITeacherStatistics.Row>(ADMIN_MODULE + `/goods/detail/${id}`);
};
