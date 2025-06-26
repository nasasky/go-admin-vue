<template>
  <div class="table-box">
    <ProTable 
      ref="proTableRef" 
      title="轮播图管理" 
      :indent="20" 
      :columns="columns" 
      :request-api="getTableList" 
      row-key="id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" @click="openAddEdit('新增轮播图')">
          新增
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
      </template>
      <template #operation="{ row }">
        <el-button 
          type="primary" 
          link 
          :icon="EditPen" 
          @click="openAddEdit('编辑轮播图', row, false)"
        >
          编辑
        </el-button>
        <el-button 
          type="primary" 
          link 
          :icon="Delete" 
          @click="deleteInfo(row)"
        >
          删除
        </el-button>
      </template>
    </ProTable>
    <BannerForm ref="bannerFormRef" />
    
    <!-- 图片预览组件 -->
    <el-image-viewer 
      v-if="showViewer"
      @close="showViewer = false"
      :url-list="[previewUrl]"
      :initial-index="0"
      :hide-on-click-modal="true"
      teleported
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { CirclePlus, Delete, EditPen } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import { useHandleData } from '@/hooks/useHandleData';
import BannerForm from './components/BannerForm.vue';
import type { ProTableInstance } from '@/components/ProTable/interface';
import {
  getBannerList,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerDetail
} from '@/api/modules/product/banner';
import type { IBanner } from '@/api/interface/product/banner';

// 图片预览相关
const showViewer = ref(false);
const previewUrl = ref('');

// 预览图片
const previewImage = (url: string) => {
  previewUrl.value = url;
  showViewer.value = true;
};

interface BannerInfo {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  sort: number;
  status: number;
}

// 表格配置项
const columns = [
  { type: 'selection', fixed: 'left', width: 60 },
  { prop: 'title', label: '标题', search: { el: 'input' } },
  { 
    prop: 'image_url', 
    label: '轮播图',
    width: 120,
    showOverflowTooltip: false,
    render: (scope: { row: BannerInfo }) => {
      return h('img', {
        src: scope.row.image_url,
        style: { 
          width: '100px', 
          height: '60px',
          objectFit: 'cover',
          cursor: 'pointer',
          borderRadius: '4px',
          border: '1px solid #eee'
        },
        onClick: () => previewImage(scope.row.image_url)
      });
    }
  },
  { prop: 'link_url', label: '链接地址' },
  { prop: 'sort', label: '排序', width: 100 },
  { 
    prop: 'status', 
    label: '状态',
    enum: [
      { label: '禁用', value: 0 },
      { label: '启用', value: 1 }
    ],
    search: { el: 'select' },
    render: (scope: { row: BannerInfo }) => {
      return h('el-tag', {
        type: scope.row.status === 1 ? 'success' : 'danger'
      }, { default: () => scope.row.status === 1 ? '启用' : '禁用' });
    }
  },
  { prop: 'operation', label: '操作', fixed: 'right', width: 180 }
];

// 获取 ProTable 元素
const proTableRef = ref<ProTableInstance>();

// 获取表格数据
const getTableList = (params: IBanner.Query) => {
  return getBannerList(params);
};

// 打开新增/编辑弹窗
const bannerFormRef = ref();
const openAddEdit = async (title: string, row = {}, isAdd = true) => {
  let formData = row;
  if (!isAdd) {
    const { data } = await getBannerDetail({ id: (row as IBanner.Info).id });
    formData = data;
  } else {
    // 新增时的默认值
    formData = {
      title: '',
      image_url: '',
      link_url: '',
      sort: 0,
      status: 1
    };
  }
  const params = {
    title,
    row: { ...formData },
    api: isAdd ? createBanner : updateBanner,
    getTableList: proTableRef.value?.getTableList
  };
  bannerFormRef.value?.acceptParams(params);
};

// 删除单个轮播图
const deleteInfo = async (params: BannerInfo) => {
  await useHandleData(deleteBanner, { ids: [params.id] }, `删除【${params.title}】轮播图`);
  proTableRef.value?.getTableList();
};

// 批量删除轮播图
const batchDelete = async (ids: number[]) => {
  await useHandleData(deleteBanner, { ids }, '删除所选轮播图');
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};
</script>

<style scoped lang="scss">
.table-box {
  :deep(img) {
    transition: all 0.3s;
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }
}
</style>