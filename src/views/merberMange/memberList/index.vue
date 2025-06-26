<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable 
        ref="proTableRef" 
        title="会员列表" 
        :columns="columns" 
        :search-columns="searchColumns"
        :request-api="getTableList" 
        :border="false"
        :loading-time="200"
        row-key="id"
      >
        <!-- 自定义列插槽 -->
        <template #avatar="{ row }">
          <el-avatar 
            :size="35" 
            :src="row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
            :class="['user-avatar', { 'no-image': !row.avatar }]"
          />
        </template>

        <template #operation="{ row }">
          <div class="operation-btns">
            <el-button type="danger" link :icon="Delete" @click="deleteInfo(row)">
              删除
            </el-button>
          </div>
        </template>
      </ProTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import { useHandleData } from '@/hooks/useHandleData';
import { deleteRole } from '@/api/modules/system/role';
import { getMemberList } from '@/api/modules/merberMange/index';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { IRole } from '@/api/interface/system/role';
import { ref } from 'vue';

defineOptions({
  name: 'MemberList'
});

// 表格配置项
const columns: ColumnProps<IRole.Info>[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'user_name', label: '用户昵称',  search: { el: 'input' } },
  { prop: 'avatar', label: '头像' },
  { prop: 'phone', label: '手机号', width: 120, search: { el: 'input' } },
  { prop: 'create_time', label: '创建时间' },
  { prop: 'update_time', label: '修改时间' },
  { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
];

// 搜索配置项
const searchColumns: SearchProps[] = [
  { prop: 'user_name', label: '用户昵称', el: 'input' },
  { prop: 'phone', label: '手机号', el: 'input' }
];

// 获取 ProTable 元素
const proTableRef = ref<ProTableInstance>();

// 获取table列表
const getTableList = (params: IRole.Query) => getMemberList(params);

// 删除信息
const deleteInfo = async (params: IRole.Info) => {
  await useHandleData(deleteRole, { ids: [params.id] }, `删除【${params.user_name}】会员`);
  proTableRef.value?.getTableList();
};
</script>

<style scoped lang="scss">
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
  }
}
</style>
