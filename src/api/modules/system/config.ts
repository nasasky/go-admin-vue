import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IConfig } from '@/api/interface/system/config';
import type { IPage, IResultData } from '@/api/interface';
import type { SystemInfo, SystemInfoReq, UpdateSystemInfoReq, SystemInfoListResult, ApiResponse } from "@/api/interface/system/config"

/**
 * 获取列表
 * @param params
 * @returns {*}
 */
export const getConfigList = (params: IConfig.Query) => {
  return http.get<IPage<IConfig.Info>>(ADMIN_MODULE + `/system/setting`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const addConfig = (params: IConfig.Form) => {
  return http.post(ADMIN_MODULE + `/system/setting`, params);
};

/**
 * 修改
 * @param params
 * @returns {*}
 */
export const editConfig = (params: IConfig.Form) => {
  return http.put(ADMIN_MODULE + `/system/setting/update`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const deleteConfig = (params: { ids: number[] }) => {
  return http.delete(ADMIN_MODULE + `/sys-config`, params);
};

/** Add system info */
export const addSystemInfo = (params: SystemInfoReq) => {
  return http.post<ApiResponse<IResultData>>(ADMIN_MODULE + "/system/info/add", params)
}

/** Update system info */
export const updateSystemInfo = (params: UpdateSystemInfoReq) => {
  return http.put<ApiResponse<IResultData>>(ADMIN_MODULE + "/system/info/update", params)
}

/** Get system info */
export const getSystemInfo = () => {
  return http.get<ApiResponse<SystemInfo>>(ADMIN_MODULE + "/system/info")
}

/** Get system info list */
export const getSystemInfoList = () => {
  return http.get<ApiResponse<SystemInfoListResult>>(ADMIN_MODULE + "/system/info/list")
}

/**
 * 获取系统配置信息（首页）
 * @returns {*}
 */
export const getSystemInfoFirst = () => {
  return http.get<SystemInfo>(ADMIN_MODULE + "/system/info/first")
}
