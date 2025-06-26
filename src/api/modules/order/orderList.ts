import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { ITeacherStatistics } from '@/api/interface/product/productList';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getorderListApi = (params: ITeacherStatistics.Query) => {
  return http.get<IPage<ITeacherStatistics.Row>>(ADMIN_MODULE + `/order/list`, params);
};
/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getrenueListApi = (params: ITeacherStatistics.Query) => {
  return http.get<IPage<ITeacherStatistics.Row>>(ADMIN_MODULE + `/order/revenue/list`, params);
};
