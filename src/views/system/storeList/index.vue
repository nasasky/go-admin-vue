<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="店铺信息管理"
      :columns="columns"
      :request-api="getTableList"
      :search-columns="searchColumns"
      :init-param="initParam"
      :tool-button="true"
      :row-key="'id'"
      @search="handleSearch"
      @reset="handleReset"
    >
      <!-- 表格头部操作按钮 -->
      <template #tableHeader="{ selectedListIds, selectedList, isSelected }">
        <el-button
          type="primary"
          :icon="Plus"
          @click="openStoreForm('新增店铺', {}, true)"
        >
          新增店铺
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="!isSelected"
          @click="batchDelete(selectedListIds)"
        >
          批量删除
        </el-button>
      </template>

      <!-- 表格操作列 -->
      <template #operation="{ row }">
        <el-button
          type="primary"
          link
          :icon="Edit"
          @click="openStoreForm('编辑店铺', row, false)"
        >
          编辑
        </el-button>
        <el-button
          type="info"
          link
          :icon="View"
          @click="viewStoreDetail(row)"
        >
          查看
        </el-button>
        <el-button
          :type="row.status === 1 ? 'warning' : 'success'"
          link
          :icon="row.status === 1 ? Lock : Unlock"
          @click="updateStoreStatus(row)"
        >
          {{ row.status === 1 ? '禁用' : '启用' }}
        </el-button>
        <el-button
          type="danger"
          link
          :icon="Delete"
          @click="deleteStore(row)"
        >
          删除
        </el-button>
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <el-tag 
          :type="row.status === 1 ? 'success' : 'danger'"
          :effect="row.status === 1 ? 'light' : 'dark'"
        >
          <el-icon v-if="row.status === 1"><CircleCheck /></el-icon>
          <el-icon v-else><CircleClose /></el-icon>
          <span style="margin-left: 4px">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </span>
        </el-tag>
      </template>

      <!-- Logo列 -->
      <template #logo="{ row }">
        <div class="logo-display">
          <el-image
            v-if="row.logo"
            :src="row.logo"
            :preview-src-list="[row.logo]"
            fit="cover"
            class="store-logo"
            :initial-index="0"
          >
            <template #error>
              <div class="logo-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div v-else class="no-logo">
            <el-icon><Picture /></el-icon>
            <span>暂无Logo</span>
          </div>
        </div>
      </template>

      <!-- 营业时间列 -->
      <template #business_hours="{ row }">
        <div v-if="row.business_hours" class="business-hours-display">
          <div
            v-for="(hour, index) in parseBusinessHours(row.business_hours)"
            :key="index"
            class="business-hour-item"
          >
            <span class="day">{{ hour.day }}</span>
            <span class="time" v-if="hour.is_open">
              <el-icon><Clock /></el-icon>
              {{ hour.start_time }} - {{ hour.end_time }}
            </span>
            <span class="closed" v-else>
              <el-icon><Close /></el-icon>
              休息
            </span>
          </div>
        </div>
        <div v-else class="no-hours">
          <el-icon><Clock /></el-icon>
          <span>暂无营业时间</span>
        </div>
      </template>
    </ProTable>

    <!-- 店铺表单 -->
    <StoreForm ref="storeFormRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Plus, 
  Edit, 
  Delete, 
  View, 
  Lock, 
  Unlock, 
  CircleCheck, 
  CircleClose,
  Clock,
  Close,
  Picture
} from '@element-plus/icons-vue';
import { useHandleData } from '@/hooks/useHandleData';
import ProTable from '@/components/ProTable/index.vue';
import StoreForm from './components/StoreForm.vue';
import {
  getStoreList,
  addStore,
  updateStore,
  deleteStore as deleteStoreApi,
  updateStoreStatus as updateStoreStatusApi,
  getStoreDetail
} from '@/api/modules/system/store';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { IStore } from '@/api/interface/system/store';

defineOptions({
  name: 'StoreList'
});

// 表格配置项
const columns: ColumnProps<IStore.Info>[] = [
  { type: 'selection', width: 80 },
  { prop: 'id', label: '编号', width: 80 },
  { prop: 'store_name', label: '店铺名称', align: 'left', minWidth: 150 },
  { prop: 'manager', label: '负责人', width: 100 },
  { prop: 'phone', label: '联系电话', width: 120 },
  { prop: 'address', label: '店铺地址', align: 'left', minWidth: 200, showOverflowTooltip: true },
  { prop: 'logo', label: 'Logo', width: 80 },
  { prop: 'business_hours', label: '营业时间', width: 200 },
  { prop: 'status', label: '状态', width: 100, tag: true },
  { prop: 'create_time', label: '创建时间', width: 160 },
  { prop: 'operation', label: '操作', width: 300, fixed: 'right' }
];

// 搜索配置项
const searchColumns: SearchProps[] = [
  { prop: 'search', label: '搜索', el: 'input', props: { placeholder: '店铺名称/负责人/电话/地址' } },
  { prop: 'status', label: '状态', el: 'select', enum: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 }
  ] }
];

// 初始化参数
const initParam = reactive({});

// 获取 ProTable 元素
const proTableRef = ref<ProTableInstance>();

// 获取表格列表
const getTableList = (params: IStore.Query) => {
  return getStoreList(params);
};

// 搜索和重置
const handleSearch = () => {
  console.log('搜索');
};

const handleReset = () => {
  console.log('重置');
};

// 店铺表单引用
const storeFormRef = ref<InstanceType<typeof StoreForm>>();

// 打开店铺表单
const openStoreForm = async (title: string, row: any = {}, isAdd = true) => {
  let formData: any = {};
  if (!isAdd) {
    try {
      const { data } = await getStoreDetail({ id: row.id! });
      formData = { ...data };
      // 解析营业时间JSON字符串
      if (formData.business_hours) {
        try {
          formData.business_hours = JSON.parse(formData.business_hours);
        } catch (e) {
          formData.business_hours = [];
        }
      }
    } catch (error) {
      console.error('获取店铺详情失败:', error);
      return;
    }
  } else {
    formData = {
      store_name: '',
      manager: '',
      manager_id: 1,
      phone: '',
      address: '',
      business_hours: [],
      logo: '',
      description: '',
      status: 1
    };
  }

  const params: View.DefaultParams = {
    title,
    row: formData,
    api: isAdd ? addStore : updateStore,
    getTableList: proTableRef.value?.getTableList
  };
  storeFormRef.value?.acceptParams(params);
};

// 查看店铺详情
const viewStoreDetail = async (row: IStore.Info) => {
  try {
    const { data } = await getStoreDetail({ id: row.id! });
    // 这里可以打开一个只读的详情弹窗
    ElMessage.info('查看详情功能待实现');
  } catch (error) {
    console.error('获取店铺详情失败:', error);
  }
};

// 删除店铺
const deleteStore = async (row: IStore.Info) => {
  await ElMessageBox.confirm(`确定要删除店铺【${row.store_name}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
  await useHandleData(deleteStoreApi, row.id!, `删除店铺【${row.store_name}】`);
  proTableRef.value?.getTableList();
};

// 批量删除
const batchDelete = async (ids: (string | number)[]) => {
  await ElMessageBox.confirm(`确定要删除选中的 ${ids.length} 个店铺吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
  // 这里需要后端提供批量删除接口
  ElMessage.warning('批量删除功能待实现');
};

// 更新店铺状态
const updateStoreStatus = async (row: IStore.Info) => {
  const newStatus = row.status === 1 ? 0 : 1;
  const statusText = newStatus === 1 ? '启用' : '禁用';
  
  await ElMessageBox.confirm(
    `确定要${statusText}店铺【${row.store_name}】吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  );
  
  await useHandleData(
    updateStoreStatusApi,
    { id: row.id!, status: newStatus },
    `${statusText}店铺【${row.store_name}】`
  );
  proTableRef.value?.getTableList();
};

// 解析营业时间JSON字符串
const parseBusinessHours = (businessHoursStr: string): IStore.BusinessHours[] => {
  try {
    return JSON.parse(businessHoursStr);
  } catch (e) {
    return [];
  }
};
</script>

<style scoped lang="scss">
// 使用系统标准的table-box样式
.table-box {
  .logo-display {
    display: flex;
    justify-content: center;
    align-items: center;
    
    .store-logo {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      border: 1px solid #e4e7ed;
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    .logo-error {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #c0c4cc;
    }
    
    .no-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: #909399;
      font-size: 12px;
      
      .el-icon {
        font-size: 16px;
        margin-bottom: 2px;
      }
      
      span {
        font-size: 10px;
        line-height: 1;
      }
    }
  }

  .business-hours-display {
    .business-hour-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      font-size: 12px;
      padding: 2px 0;

      .day {
        width: 30px;
        color: #606266;
        font-weight: 500;
      }

      .time {
        color: #67c23a;
        display: flex;
        align-items: center;
        gap: 2px;
        
        .el-icon {
          font-size: 10px;
        }
      }

      .closed {
        color: #f56c6c;
        display: flex;
        align-items: center;
        gap: 2px;
        
        .el-icon {
          font-size: 10px;
        }
      }
    }
  }

  .no-hours {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 12px;
    gap: 4px;
    
    .el-icon {
      font-size: 12px;
    }
  }
}
</style> 