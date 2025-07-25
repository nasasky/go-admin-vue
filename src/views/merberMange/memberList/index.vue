<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable 
        ref="proTableRef" 
        title="会员列表" 
        :columns="columns" 
        :search-columns="searchColumns"
        :request-api="getTableList" 
        :search-col="4"
        :border="false"
        :loading-time="200"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="Download" plain @click="downloadFile">
            导出
          </el-button>
        </template>

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

      <!-- 导出条件选择对话框 -->
      <el-dialog v-model="exportDialogVisible" title="选择导出条件" width="600px" :destroy-on-close="true">
        <el-form ref="exportFormRef" :model="exportForm" label-width="100px" label-suffix=":">
          <el-form-item label="姓名">
            <el-input v-model="exportForm.name" placeholder="请输入姓名" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="exportForm.phone" placeholder="请输入手机号" clearable />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="exportForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="用户昵称">
            <el-input v-model="exportForm.user_name" placeholder="请输入用户昵称" clearable />
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="exportForm.search" placeholder="在用户名、手机号、昵称中搜索" clearable />
          </el-form-item>
          <el-form-item label="注册时间">
            <el-date-picker
              v-model="exportForm.dateRange"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button @click="resetExportForm">重置</el-button>
          <el-button type="primary" @click="confirmExport">确认导出</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Download } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import { useHandleData } from '@/hooks/useHandleData';
import { getMemberList, deleteMember, exportMemberList } from '@/api/modules/merberMange/index';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { IMember } from '@/api/interface/merberMange/member';
import { ref } from 'vue';
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus';

defineOptions({
  name: 'MemberList'
});

// 表格配置项
const columns: ColumnProps<IMember.Info>[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'user_name', label: '用户昵称' },
  { prop: 'avatar', label: '头像' },
  { prop: 'phone', label: '手机号', width: 120 },
  { prop: 'name', label: '姓名' },
  { prop: 'username', label: '用户名' },
  { prop: 'create_time', label: '创建时间' },
  { prop: 'update_time', label: '修改时间' },
  { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
];

// 搜索配置项
const searchColumns: SearchProps[] = [
  { prop: 'search', label: '关键词', el: 'input', span: 1, props: { placeholder: '在用户名、手机号、昵称中搜索' } },
  { prop: 'phone', label: '手机号', el: 'input', span: 1, props: { placeholder: '请输入手机号' } },
  { prop: 'name', label: '姓名', el: 'input', span: 1, props: { placeholder: '请输入姓名' } },
  { prop: 'username', label: '用户名', el: 'input', span: 1, props: { placeholder: '请输入用户名' } },
  { prop: 'user_name', label: '用户昵称', el: 'input', span: 1, props: { placeholder: '请输入用户昵称' } },
  {
    prop: 'dateRange',
    label: '注册时间',
    el: 'date-picker',
    span: 2,
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '选择时间范围'
    }
  }
];

// 获取 ProTable 元素
const proTableRef = ref<ProTableInstance>();

// 导出相关
const exportDialogVisible = ref(false);
const exportFormRef = ref();
const exportForm = ref<Partial<IMember.Query>>({
  name: '',
  phone: '',
  username: '',
  user_name: '',
  search: '',
  dateRange: []
});

// 获取table列表
const getTableList = (params: IMember.Query) => {
  let newParams = formatParams(params);
  return getMemberList(newParams);
};

const formatParams = (params: IMember.Query) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.dateRange) {
    newParams.start_date = newParams.dateRange[0];
    newParams.end_date = newParams.dateRange[1];
    delete newParams.dateRange;
  }
  return newParams;
};

// 删除信息
const deleteInfo = async (params: IMember.Info) => {
  await useHandleData(deleteMember, { ids: [params.id] }, `删除【${params.user_name}】会员`);
  proTableRef.value?.getTableList();
};

// 导出 - 打开导出条件选择对话框
const downloadFile = async () => {
  // 将当前搜索条件填入导出表单
  const currentParams = proTableRef.value?.searchParam as IMember.Query;
  if (currentParams) {
    exportForm.value = {
      name: currentParams.name || '',
      phone: currentParams.phone || '',
      username: currentParams.username || '',
      user_name: currentParams.user_name || '',
      search: currentParams.search || '',
      dateRange: currentParams.dateRange || []
    };
  }
  exportDialogVisible.value = true;
};

// 重置导出表单
const resetExportForm = () => {
  exportForm.value = {
    name: '',
    phone: '',
    username: '',
    user_name: '',
    search: '',
    dateRange: []
  };
};

// 确认导出
const confirmExport = async () => {
  exportDialogVisible.value = false;
  
  const confirmed = await ElMessageBox.confirm('确认导出会员数据?', '温馨提示', { type: 'warning' })
    .catch(() => false);
  
  if (!confirmed) return;

  const loading = ElLoading.service({
    lock: true,
    text: '正在导出...',
    spinner: 'el-icon-loading'
  });
  
  try {
    const formattedParams = formatParams(exportForm.value as IMember.Query);
    
    // 移除空值
    const cleanParams: Partial<IMember.Query> = {};
    Object.keys(formattedParams).forEach(key => {
      const value = formattedParams[key as keyof IMember.Query];
      if (value !== '' && value !== null && value !== undefined) {
        (cleanParams as any)[key] = value;
      }
    });

    const response = await exportMemberList(cleanParams);
    
    // 调试信息
    console.log('导出响应数据类型:', typeof response.data);
    console.log('导出响应数据:', response.data);
    
    // 验证响应数据是否有效
    if (!response.data) {
      throw new Error('导出数据为空');
    }
    
    // 创建blob时使用更精确的配置
    // 尝试多种MIME类型以提高兼容性
    let mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    // 如果是旧版Excel或兼容性问题，可以尝试这个MIME类型
    // mimeType = 'application/vnd.ms-excel';
    
    const blob = new Blob([response.data as BlobPart], { 
      type: mimeType
    });
    
    // 验证blob是否创建成功
    if (blob.size === 0) {
      throw new Error('导出文件为空');
    }
    
    console.log('创建的blob大小:', blob.size);
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 生成文件名
    const now = new Date();
    const timestamp = now.getFullYear() + 
      String(now.getMonth() + 1).padStart(2, '0') + 
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') + 
      String(now.getMinutes()).padStart(2, '0') + 
      String(now.getSeconds()).padStart(2, '0');
    
    link.download = `会员列表_${timestamp}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  } finally {
    loading.close();
  }
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
