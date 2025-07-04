<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTableRef"
        title="资讯列表"
        :columns="columns"
        :search-columns="searchColumns"
        :request-api="getTableList"
        :border="false"
        :loading-time="200"
        row-key="id"
      >
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openForm('新增资讯')">
            新增资讯
          </el-button>
          <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
            批量删除
          </el-button>
        </template>
        <template #operation="{ row }">
          <div class="operation-btns">
            <el-button type="primary" link :icon="EditPen" @click="openForm('编辑资讯', row)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="deleteNewsItem(row.id)">
              删除
            </el-button>
          </div>
        </template>
      </ProTable>
      <NewsForm ref="newsFormRef" @refresh="proTableRef?.getTableList()" />

      <!-- 图片预览 -->
      <el-image-viewer 
        v-if="showViewer" 
        :url-list="[previewUrl]" 
        :initial-index="0"
        @close="showViewer = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { CirclePlus, Delete, EditPen, Picture } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import NewsForm from './components/NewsForm.vue';
import { getNewsList, deleteNews } from '@/api/modules/news';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import { useHandleData } from '@/hooks/useHandleData';
import { ElImageViewer } from 'element-plus';

defineOptions({
  name: 'NewsList'
});

const proTableRef = ref<ProTableInstance>();
const newsFormRef = ref();

// 图片预览相关
const showViewer = ref(false);
const previewUrl = ref('');

// 预览图片
const previewImage = (url: string) => {
  previewUrl.value = url;
  showViewer.value = true;
};

const columns: ColumnProps[] = [
  { type: 'selection', width: 55 },
  { prop: 'title', label: '标题' },
  { 
    prop: 'cover_image', 
    label: '封面图',
    width: 120,
    showOverflowTooltip: false,
    render: (scope: { row: any }) => {
      if (scope.row.cover_image) {
        return h('img', {
          src: scope.row.cover_image,
          style: { 
            width: '100px', 
            height: '60px',
            objectFit: 'cover',
            cursor: 'pointer',
            borderRadius: '4px',
            border: '1px solid #eee'
          },
          onClick: () => previewImage(scope.row.cover_image)
        });
      } else {
        return h('div', {
          style: {
            width: '100px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f7fa',
            color: '#909399',
            fontSize: '20px',
            borderRadius: '4px',
            border: '1px solid #eee'
          }
        }, [h('el-icon', {}, [h(Picture)])]);
      }
    }
  },
  { prop: 'sort', label: '排序'},
  { 
    prop: 'status', 
    label: '状态',
    tag: true, 
    enum: [
      { label: '启用', value: 1, tagType: 'success' }, 
      { label: '禁用', value: 0, tagType: 'info' }
    ] 
  },
  { prop: 'create_time', label: '创建时间', width: 180 },
  { prop: 'operation', label: '操作', fixed: 'right' }
];

const searchColumns: SearchProps[] = [
  { prop: 'title', label: '标题', el: 'input' },
  { 
    prop: 'status', 
    label: '状态', 
    el: 'select', 
    props: { 
      options: [
        { label: '启用', value: 1 }, 
        { label: '禁用', value: 0 }
      ] 
    } 
  }
];

const getTableList = (params: any) => {
  return getNewsList(params);
};

const openForm = (title: string, row: any = {}) => {
  newsFormRef.value?.acceptParams({ 
    title, 
    row, 
    api: null, 
    getTableList: proTableRef.value?.getTableList 
  });
};

const batchDelete = async (ids: (string | number)[]) => {
  await useHandleData(deleteNews, { ids }, '删除所选资讯');
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};

const deleteNewsItem = async (id: number) => {
  await useHandleData(deleteNews, { ids: [id] }, '删除资讯');
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

    :deep(img) {
      transition: all 0.3s;
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
    }

    :deep(.el-button) {
      margin-right: 8px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
}

// 确保图片预览在最顶层
:deep(.el-image-viewer__wrapper) {
  z-index: 3000;
}
</style> 