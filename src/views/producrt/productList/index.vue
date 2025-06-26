<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable 
        ref="proTableRef" 
        title="商品列表" 
        :columns="columns" 
        :search-columns="searchColumns"
        :request-api="getTableList" 
        :border="false"
        :loading-time="200"
        row-key="id"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="CirclePlus" @click="openAddEdit('新增商品')">
            新增商品
          </el-button>
          <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
            批量删除
          </el-button>
          <el-button v-auth="'teacher.statistics.import'" type="primary" :icon="Upload" plain @click="importData">
            导入
          </el-button>
          <el-button v-auth="'teacher.statistics.export'" type="primary" :icon="Download" plain @click="downloadFile">
            导出
          </el-button>
        </template>

        <!-- 自定义列插槽 -->
        <template #cover="{ row }">
          <div class="image-wrapper" v-if="row.cover" @click="handlePreview(row.cover)">
            <el-image 
              :src="row.cover" 
              fit="cover"
              class="goods-image"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div v-else class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>

        <template #price="{ row }">
          <span class="price">¥{{ row.price }}</span>
        </template>

        <template #operation="{ row }">
          <div class="operation-btns">
            <el-button type="primary" link :icon="EditPen" @click="openAddEdit('编辑商品', row, false)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="deleteInfo(row)">
              删除
            </el-button>
          </div>
        </template>
      </ProTable>
      <ProductStatisticsForm ref="teacherStatisticsRef" />
      <ImportExcel ref="ImportExcelRef" />

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
import { ref } from 'vue';
import { CirclePlus, Delete, EditPen, Upload, Download, Picture } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import {
  importTeacherStatisticsExcelApi,
  exportTeacherStatisticsExcelApi,
} from '@/api/modules/teacher/teacherStatistics';
import { getproductListApi, createproductApi, updateGoodsApi, removeApi, getDetailApi } from '@/api/modules/product/productList';
import { useHandleData } from '@/hooks/useHandleData';
import ProductStatisticsForm from '@/views/producrt/productList/components/ProductStatisticsForm.vue';
import { useOptionsStore } from '@/stores/modules/options';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { ITeacherStatistics } from '@/api/interface/teacher/teacherStatistics';
import ImportExcel from '@/components/ImportExcel/index.vue';
import { downloadTemplate } from '@/api/modules/system/common';
import { ElMessageBox, ElImageViewer } from 'element-plus';
import { useDownload } from '@/hooks/useDownload';

defineOptions({
  name: 'ProductList'
});

const optionsStore = useOptionsStore();
const proTableRef = ref<ProTableInstance>();

// 表格配置项
const columns: ColumnProps<ITeacherStatistics.Row>[] = [
  { type: 'selection', width: 55 },
  { prop: 'goods_name', label: '商品名称', search: { el: 'input' } },
  { prop: 'cover', label: '商品图片', width: 100 },
  { prop: 'price', label: '价格', width: 100 },
  { prop: 'stock', label: '库存量', width: 100 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    tag: true,
    enum: optionsStore.getDictOptions('goods_status'),
    fieldNames: {
      label: 'codeName',
      value: 'code',
      tagType: 'callbackShowStyle'
    }
  },
  { prop: 'create_time', label: '创建时间', width: 180 },
  { prop: 'operation', label: '操作', width: 150, fixed: 'right' }
];

// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'goods_name', label: '商品名称', el: 'input' },
  { 
    prop: 'status', 
    label: '商品状态', 
    el: 'select',
    props: { 
      options: optionsStore.getDictOptions('goods_status'),
      fieldNames: {
        label: 'codeName',
        value: 'code'
      }
    }
  },
  {
    prop: 'create_time',
    label: '创建时间',
    el: 'date-picker',
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 获取table列表
const getTableList = (params: ITeacherStatistics.Query) => {
  let newParams = formatParams(params);
  return getproductListApi(newParams);
};

const formatParams = (params: ITeacherStatistics.Query) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.create_time) {
    newParams.startTime = newParams.create_time[0];
    newParams.endTime = newParams.create_time[1];
    delete newParams.create_time;
  }
  return newParams;
};

// 打开 drawer(新增、查看、编辑)
const teacherStatisticsRef = ref<InstanceType<typeof TeacherStatisticsForm>>();
const openAddEdit = async (title: string, row: any = {}, isAdd = true) => {
  if (!isAdd) {
    const record = await getDetailApi({ id: row?.id });
    row = record?.data;
  }
  const params = {
    title,
    row: { ...row },
    api: isAdd ? createproductApi : updateGoodsApi,
    getTableList: proTableRef.value?.getTableList
  };
  teacherStatisticsRef.value?.acceptParams(params);
};

// 删除信息
const deleteInfo = async (params: ITeacherStatistics.Row) => {
  await useHandleData(removeApi, { ids: [params.id] }, `删除【${params.goods_name}】商品`);
  proTableRef.value?.getTableList();
};

// 批量删除信息
const batchDelete = async (ids: (string | number)[]) => {
  await useHandleData(removeApi, { ids }, '删除所选商品');
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};

// 导入
const ImportExcelRef = ref<InstanceType<typeof ImportExcel>>();
const importData = () => {
  const params = {
    title: '商品导入',
    templateName: '商品导入模板',
    tempApi: downloadTemplate,
    importApi: importTeacherStatisticsExcelApi,
    getTableList: proTableRef.value?.getTableList
  };
  ImportExcelRef.value?.acceptParams(params);
};

// 导出
const downloadFile = async () => {
  ElMessageBox.confirm('确认导出商品数据?', '温馨提示', { type: 'warning' }).then(() => {
    let newParams = formatParams(proTableRef.value?.searchParam as ITeacherStatistics.Query);
    useDownload(exportTeacherStatisticsExcelApi, '商品数据', newParams);
  });
};

// 图片预览相关
const showViewer = ref(false);
const previewUrl = ref('');

const handlePreview = (url: string) => {
  previewUrl.value = url;
  showViewer.value = true;
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

    :deep(.image-wrapper) {
      cursor: pointer;
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
    }

    :deep(.goods-image) {
      width: 100%;
      height: 100%;
      display: block;
    }

    :deep(.image-placeholder) {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f7fa;
      color: #909399;
      font-size: 20px;
      border-radius: 4px;
    }

    :deep(.price) {
      color: #ff4d4f;
      font-weight: 500;
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
