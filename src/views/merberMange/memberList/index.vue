<template>
  <div class="table-box">
    <ProTable ref="proTableRef" title="角色列表" :indent="20" :columns="columns" :search-columns="searchColumns"
      :request-api="getTableList">
      <template #operation="{ row }">
        <el-button type="primary" link :icon="Delete" @click="deleteInfo(row)">
          删除
        </el-button>
      </template>
    </ProTable>
    <RoleForm ref="roleFormRef" />
    <RolePermissions ref="rolePermissionsRef" />
  </div>
</template>

<script setup lang="ts">
import { CirclePlus, Delete, EditPen, Lock } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import { useHandleData } from '@/hooks/useHandleData';
import { addRole, deleteRole, editRole, setRoleMenus } from '@/api/modules/system/role';
import { getMemberList } from '@/api/modules/merberMange/index';
import RoleForm from '@/views/system/roleManage/components/RoleForm.vue';
import RolePermissions from '@/views/system/roleManage/components/RolePermissions.vue';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { IRole } from '@/api/interface/system/role';
import { ref } from 'vue';

defineOptions({
  name: 'RoleManage'
});

// 表格配置项
const columns: ColumnProps<IRole.Info>[] = [
  { type: 'selection', width: 80, selectable: row => row.isLock !== 'T' },
  { prop: 'id', label: '编号', width: 80 },
  { prop: 'user_name', label: '用户呢称' },
  { prop: 'avatar', label: '头像' },
  { prop: 'phone', label: '手机号' },
  { prop: 'update_time', label: '创建时间' },
  { prop: 'update_time', label: '修改时间' },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' }
];
// 表格配置项
const searchColumns: SearchProps[] = [
  { prop: 'search', label: '关键字', el: 'input' },
  // { prop: 'permissions', label: '标识', el: 'input' }
];

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref<ProTableInstance>();

// 获取table列表
const getTableList = (params: IRole.Query) => getMemberList(params);

const roleFormRef = ref<InstanceType<typeof RoleForm>>();
const openRoleForm = (title: string, row = {}, isAdd = true) => {
  const params: View.DefaultParams = {
    title,
    row: { ...row },
    api: isAdd ? addRole : editRole,
    getTableList: proTableRef.value?.getTableList
  };
  roleFormRef.value?.acceptParams(params);
};

const rolePermissionsRef = ref<InstanceType<typeof RolePermissions>>();
const openRolePermissions = (title: string, row = {}) => {
  const params: View.DefaultParams = {
    title,
    row: { ...row },
    api: setRoleMenus
  };
  rolePermissionsRef.value?.acceptParams(params);
};

// 删除信息
const deleteInfo = async (params: IRole.Info) => {
  await useHandleData(deleteRole, { ids: [params.id] }, `删除【${params.roleName}】角色`);
  proTableRef.value?.getTableList();
};

// 批量删除信息
const batchDelete = async (ids: (string | number)[]) => {
  await useHandleData(deleteRole, { ids }, '删除所选角色信息');
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};
</script>
