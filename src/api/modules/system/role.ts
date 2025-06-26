import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IRole } from '@/api/interface/system/role';
import type { IPage } from '@/api/interface';

/**
 * 获取角色列表
 * @param params
 * @returns {*}
 */
export const getRoleList = (params: IRole.Query) => {
  return http.get<IPage<IRole.Info>>(ADMIN_MODULE + `/role/list`, params);
};

/**
 * 添加角色
 * @param params
 * @returns {*}
 */
export const addRole = (params: IRole.Form) => {
  return http.post(ADMIN_MODULE + `/role/add`, params);
};

/**
 * 修改角色
 * @param params
 * @returns {*}
 */
export const editRole = (params: IRole.Form) => {
  return http.put(ADMIN_MODULE + `/role/update`, params);
};

/**
 * 删除角色
 * @param params
 * @returns {*}
 */
export const deleteRole = (params: { ids: number[] }) => {
  return http.delete(ADMIN_MODULE + `/role/detail`, params);
};

/**
 * 获取角色菜单权限
 * @param params
 * @returns {*}
 */
export const getRoleMenus = (params: { id: number }) => {
  return http.get<IRole.Menu>(ADMIN_MODULE + `/role/detail`, params);
};

/**
 * 设置角色菜单权限
 * @param params
 * @returns {*}
 */
export const setRoleMenus = (params: IRole.MenuForm) => {
  return http.post(ADMIN_MODULE + `/role/set/permission`, params);
};
