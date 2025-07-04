import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IUserNotificationQuery, IUserNotificationRow, IUserNotificationResponse } from '@/api/interface/system/userNotification';

/**
 * 获取管理员用户接收记录列表
 * @param params
 * @returns {*}
 */
export const getUserNotificationListApi = (params: IUserNotificationQuery) => {
  return http.get<IPage<IUserNotificationRow>>(ADMIN_MODULE + `/notification/admin-receive-records`, params);
};

/**
 * 获取管理员用户接收记录详情
 * @param params
 * @returns {*}
 */
export const getUserNotificationDetailApi = (params: { id: string }) => {
  const { id } = params;
  return http.get<IUserNotificationResponse>(ADMIN_MODULE + `/notification/admin-receive-records/${id}`);
}; 