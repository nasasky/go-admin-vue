import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { ISysFile } from '@/api/interface/system/file';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getSysFileListApi = (params: ISysFile.Query) => {
  return http.get<IPage<ISysFile.Row>>(ADMIN_MODULE + `/system/log`, params);
};

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getUserFileListApi = (params: ISysFile.Query) => {
  return http.get<IPage<ISysFile.Row>>(ADMIN_MODULE + `/system/user/log`, params);
};

/**
 * 清除系统日志
 * @returns {*}
 */
export const clearSystemLogApi = () => {
  return http.delete(ADMIN_MODULE + `/system/log`);
};

/**
 * 清除用户日志
 * @returns {*}
 */
export const clearUserLogApi = () => {
  return http.delete(ADMIN_MODULE + `/system/user/log`);
};


