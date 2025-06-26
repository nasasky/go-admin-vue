<template>
  <div class="main-box">
    <!-- <DeptTree
      label="name"
      title="部门列表"
      :request-api="getUserDeptTree"
      :default-value="initParam.deptId"
      @change="changeDeptTree"
      ref="deptTreeRef"
    /> -->
    <div class="table-box">
      <ProTable
        ref="proTableRef"
        title="用户列表"
        :indent="20"
        :columns="columns"
        :search-columns="searchColumns"
        :request-api="getTableList"
        :search-col="4"
        :init-param="initParam"
        :border="false"
        :loading-time="200"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openUserAdd('新增用户')">
            新增用户
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            plain
            :disabled="!scope.isSelected"
            @click="batchDelete(scope.selectedListIds)"
          >
            批量删除
          </el-button>
          <el-button type="info" :icon="Unlock" plain :disabled="!scope.isSelected" @click="unlock(scope.selectedListIds)">
            解锁
          </el-button>
        </template>

        <template #logo="{ row }">
          <el-avatar 
            :size="40" 
            :src="row.logo || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
            :class="['user-avatar', { 'no-image': !row.logo }]"
          />
        </template>

        <template #username="{ row }">
          <span class="username-text">{{ row.username }}</span>
        </template>

        <template #nickname="{ row }">
          <span>{{ row.nickname || '--' }}</span>
        </template>

        <template #phone="{ row }">
          <span>{{ row.phone || '--' }}</span>
        </template>

        <template #role_name="{ row }">
          <el-tag size="small" type="info" effect="plain">
            {{ row.role_name || '--' }}
          </el-tag>
        </template>

        <template #enable="{ row }">
          <el-tag :type="row.enable === 1 ? 'success' : 'danger'" size="small">
            {{ row.enable === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>

        <template #last_login_time="{ row }">
          {{ row.last_login_time || '--' }}
        </template>

        <template #create_time="{ row }">
          {{ row.create_time || '--' }}
        </template>

        <template #deptInfo="{ row }">
          <el-tag class="user-item" v-for="tag in formatInfo(row.deptInfo)" :key="tag.id" type="info">
            {{ tag.name }}
          </el-tag>
        </template>

        <template #roleInfo="{ row }">
          <el-tag class="user-item" v-for="tag in formatInfo(row.roleInfo)" :key="tag.id" type="info">
            {{ tag.name }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <div class="operation-btns">
            <el-button type="primary" link :icon="EditPen" @click="openUserEdit('编辑用户', row)">
              编辑
            </el-button>
            <el-button type="primary" link :icon="Unlock" @click="unlock([row.id])">
              解锁
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="deleteInfo(row)">
              删除
            </el-button>
          </div>
        </template>
      </ProTable>
      <UserAdd ref="userAddRef" @submit="refreshDeptTree" />
      <UserEdit ref="userEditRef" />
      <UserPermissions ref="userPermissionsRef" />
      <UserDeptForm ref="userDeptFormRef" @submit="refreshDeptTree" />
      <UserDataPermissions ref="userDataPermissionsRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CirclePlus, Delete, EditPen, User, Unlock, Refresh, DArrowRight } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import DeptTree from '@/views/system/accountManage/components/DeptTree.vue';
import { useHandleData } from '@/hooks/useHandleData';
import {
  addUser,
  deleteUser,
  editUser,
  getUserDeptTree,
  getUserList,
  setUserRole,
  unlockUser,
  resetPassword,
  getUserDetailApi,
  setUserDataRole
} from '@/api/modules/system/user';
import { useOptionsStore } from '@/stores/modules/options';
import UserAdd from '@/views/system/accountManage/components/UserAdd.vue';
import UserEdit from '@/views/system/accountManage/components/UserEdit.vue';
import UserPermissions from '@/views/system/accountManage/components/UserPermissions.vue';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { IUser } from '@/api/interface/system/user';
import type { IRole } from '@/api/interface/system/role';
import { reactive, ref, onMounted } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import UserDeptForm from '@/views/system/accountManage/components/UserDeptForm.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import UserDataPermissions from '@/views/system/accountManage/components/UserDataPermissions.vue';
import { IS_PREVIEW } from '@/config';

defineOptions({
  name: 'AccountManage'
});

const optionsStore = useOptionsStore();

// 初始化字典数据
onMounted(async () => {
  if (!optionsStore.isLoaded) {
    await optionsStore.getAllDictList();
  }
});

// 表格配置项
const columns: ColumnProps<IRole.Info>[] = [
  { type: 'selection', width: 55, selectable: row => row.id !== 1 },
  { prop: 'logo', label: '头像', width: 70 },
  { prop: 'username', label: '账户', width: 120, align: 'left', search: { el: 'input' } },
  { prop: 'nickname', label: '昵称', width: 120, align: 'left' },
  { prop: 'phone', label: '手机号', width: 120, search: { el: 'input' } },
  { prop: 'role_name', label: '角色', width: 120 },
  {
    prop: 'enable',
    label: '状态',
    tag: true,
    width: 80,
    enum: optionsStore.getDictOptions('account_status'),
    fieldNames: { label: 'codeName', value: 'code', tagType: 'callbackShowStyle' }
  },
  { prop: 'last_login_time', label: '最后登录', width: 160 },
  { prop: 'create_time', label: '创建时间', width: 160 },
  { prop: 'operation', label: '操作', width: 260, fixed: 'right' }
];

const searchColumns: SearchProps[] = [
  { prop: 'username', label: '账户', el: 'input' },
  { prop: 'phone', label: '手机号', el: 'input' },
];

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref<ProTableInstance>();

// 获取table列表
const getTableList = (params: IUser.Query) => {
  console.log('params', params);
  return getUserList(params);
};

const userAddRef = ref<InstanceType<typeof UserAdd>>();
const openUserAdd = (title: string) => {
  const params: View.DefaultParams = {
    title,
    row: { deptId: initParam.deptId },
    api: addUser,
    getTableList: proTableRef.value?.getTableList
  };
  userAddRef.value?.acceptParams(params);
};

const userEditRef = ref<InstanceType<typeof UserEdit>>();
const openUserEdit = async (title: string, row: any = {}) => {
  const { data } = await getUserDetailApi({ id: row.id });
  const params: View.DefaultParams = {
    title,
    row: { ...data },
    api: editUser,
    getTableList: proTableRef.value?.getTableList
  };
  userEditRef.value?.acceptParams(params);
};

const userPermissionsRef = ref<InstanceType<typeof UserPermissions>>();
const openUserPermissions = (title: string, row = {}) => {
  const params = {
    title,
    row: row,
    api: setUserRole,
    getTableList: proTableRef.value?.getTableList
  };
  userPermissionsRef.value?.acceptParams(params);
  proTableRef.value?.getTableList();
};
const deptTreeRef = ref<InstanceType<typeof DeptTree>>();

// 删除信息
const deleteInfo = async (params: IUser.Info) => {
  if (IS_PREVIEW) {
    return ElMessage.warning({ message: '预览环境，禁止删除，请谅解！' });
  }
  await useHandleData(deleteUser, { ids: [params.id] }, `删除【${params.username}】用户`);
  proTableRef.value?.getTableList();
  refreshDeptTree();
};

// 批量删除信息
const batchDelete = async (ids: (string | number)[]) => {
  await useHandleData(deleteUser, { ids }, '删除所选用户信息');
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
  refreshDeptTree();
};
const userDeptFormRef = ref<InstanceType<typeof UserDeptForm>>();
const settingDept = (record: any) => {
  if (record.selectedListIds) {
    const params = {
      title: '批量设置部门',
      row: {},
      api: undefined,
      getTableList: proTableRef.value?.getTableList,
      selectedList: record.selectedList, //选中的行信息
      deptId: selectTreeId.value,
      selectIds: record.selectedListIds,
      isBatch: true
    };
    userDeptFormRef.value?.acceptParams(params);
  } else {
    const params = {
      title: '设置部门',
      row: {},
      api: undefined,
      getTableList: proTableRef.value?.getTableList,
      selectedList: [record], //选中的行信息
      deptId: record.deptIds.split(',').map(Number),
      selectIds: [record.id],
      isBatch: false
    };
    userDeptFormRef.value?.acceptParams(params);
  }
};

const unlock = async (id: (string | number)[]) => {
  if (Array.isArray(id)) {
    await unlockUser({ ids: id });
  } else {
    await unlockUser({ ids: [id] });
  }
  ElMessage.success(`解锁成功！`);
};

const resetPwd = async (row: any) => {
  const param = { id: row?.id };
  ElMessageBox.confirm('您确认要重置账户 [' + row.username + '] 密码?', '温馨提示', {
    type: 'warning'
  }).then(async () => {
    await resetPassword(param);
    proTableRef.value?.getTableList();
    ElMessage.success({
      message: `账户 [` + row.username + `] 重置密码成功！`,
      duration: 5000,
      showClose: true
    });
  });
};

const initParam = reactive({ deptId: -1 });

const selectTreeId = ref<number[]>([]);
const changeDeptTree = (val: number) => {
  if (val) {
    selectTreeId.value = [val];
    initParam.deptId = val;
    proTableRef.value?.clearSelection();
  }
};

const formatInfo = (info: string): { id: string; name: string }[] => {
  if (info.trim() === '') {
    return [];
  }
  let departments: { id: string; name: string }[] = [];
  // 使用逗号分割字符串
  let departmentArray = info.split(',');
  // 遍历每个部门的键值对
  departmentArray.forEach(function (department: string) {
    // 使用冒号分割键值对
    let keyValue = department.split(':');
    // 构造部门对象
    let departmentObj = {
      id: keyValue[0],
      name: keyValue[1]
    };
    // 添加到数组
    departments.push(departmentObj);
  });
  return departments;
};

const refreshDeptTree = () => {
  deptTreeRef.value?.refresh();
};

// 设置数据角色
const userDataPermissionsRef = ref<InstanceType<typeof UserDataPermissions>>();
const openUserDataPermissions = (title: string, row = {}) => {
  const params = {
    title,
    row: row,
    api: setUserDataRole,
    getTableList: proTableRef.value?.getTableList
  };
  userDataPermissionsRef.value?.acceptParams(params);
  proTableRef.value?.getTableList();
};
</script>

<style scoped lang="scss">
.user-item {
  margin: 5px;
}

.btn-group {
  display: flex;
  justify-content: center;
}

.el-button + .el-button + .el-dropdown {
  margin-left: 12px;
}

.main-box {
  display: flex;
  width: 100%;
  height: 100%;
  .table-box {
    flex: 1;
    :deep(.operation-btns) {
      .el-button {
        padding: 5px 8px;
        margin-right: 6px;
        &:last-child {
          margin-right: 0;
        }
      }
    }
    :deep(.el-tag) {
      margin: 2px 4px;
    }
    :deep(.user-avatar) {
      border: 1px solid #eee;
      transition: transform 0.3s;
      &:hover {
        transform: scale(1.1);
      }
      &.no-image {
        background-color: #f5f7fa;
      }
    }
    :deep(.username-text) {
      color: var(--el-color-primary);
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
