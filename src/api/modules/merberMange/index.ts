import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IMember } from '@/api/interface/merberMange/member';
import type { IPage } from '@/api/interface';

/**
 * 获取会员列表
 * @param params
 * @returns {*}
 */
export const getMemberList = (params: IMember.Query) => {
  return http.get<IPage<IMember.Info>>(ADMIN_MODULE + `/member/list`, params);
};

/**
 * 删除会员
 * @param params
 * @returns {*}
 */
export const deleteMember = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/member/delete`, params);
};

/**
 * 导出会员列表 (GET请求)
 * @param params
 * @returns {*}
 */
export const exportMemberList = (params: Partial<IMember.Query>) => {
  return http.get(ADMIN_MODULE + `/member/export`, params, { responseType: 'blob' });
};

/**
 * 获取会员统计数据
 * @param params
 * @returns {*}
 */
export const getMemberStats = (params: IMember.StatsQuery) => {
  return http.get<IMember.StatsData>(ADMIN_MODULE + `/member/stats`, params);
};
