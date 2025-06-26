import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IRole } from '@/api/interface/system/role';
import type { IPage } from '@/api/interface';

/**
 * 获取会员列表
 * @param params
 * @returns {*}
 */
export const getMemberList = (params: IRole.Query) => {
  return http.get<IPage<IRole.Info>>(ADMIN_MODULE + `/member/list`, params);
};
