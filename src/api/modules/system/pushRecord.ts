import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IPushRecordQuery, IPushRecordRow, IPushRecordResponse } from '@/api/interface/system/pushRecord';

/**
 * 获取推送记录列表
 * @param params
 * @returns {*}
 */
export const getPushRecordListApi = (params: IPushRecordQuery) => {
  return http.get<IPage<IPushRecordRow>>(ADMIN_MODULE + `/notification/records`, params);
};

/**
 * 获取推送记录详情
 * @param params
 * @returns {*}
 */
export const getPushRecordDetailApi = (params: { id: string }) => {
  const { id } = params;
  return http.get<IPushRecordResponse>(ADMIN_MODULE + `/notification/records/${id}`);
}; 