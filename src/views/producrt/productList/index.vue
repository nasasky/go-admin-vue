<template>
  <div class="table-box">
    <ProTable ref="proTableRef" title="教师统计" :indent="20" :columns="columns" :search-columns="searchColumns"
      :request-api="getTableList" row-key="id">
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" @click="openAddEdit('新增商品')">
          新增
        </el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)">
          批量删除
        </el-button>
        <el-button v-auth="'teacher.statistics.import'" type="primary" :icon="Upload" plain @click="importData">
          导入
        </el-button>
        <el-button v-auth="'teacher.statistics.export'" type="primary" :icon="Download" plain @click="downloadFile">
          导出
        </el-button>
      </template>
      <template #operation="{ row }">
        <el-button type="primary" link :icon="EditPen" @click="openAddEdit('编辑商品', row, false)">
          编辑
        </el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteInfo(row)">
          删除
        </el-button>
      </template>
    </ProTable>
    <ProductStatisticsForm ref="teacherStatisticsRef" />
    <ImportExcel ref="ImportExcelRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CirclePlus, Delete, EditPen, Upload, Download } from '@element-plus/icons-vue';
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
import { ElMessageBox } from 'element-plus';
import { useDownload } from '@/hooks/useDownload';

defineOptions({
  name: 'TeacherStatisticsView'
});
// useDict(['account_status', 'dynamic_user_options']); // 使用useDict Hook 主动加载字典 【演示案例】
const optionsStore = useOptionsStore();
const proTableRef = ref<ProTableInstance>();
// 表格配置项
const columns: ColumnProps<ITeacherStatistics.Row>[] = [
  { type: 'selection', width: 80 },
  { prop: 'goods_name', label: '商品名称' },
  { prop: 'price', label: '价格' },
  { prop: 'stock', label: '库存量' },
  { prop: 'cover', label: '封面' },
  {
    prop: 'status',
    label: '状态',
    tag: true,
    enum: optionsStore.getDictOptions('goods_status'),
    fieldNames: {
      label: 'codeName',
      value: 'code',
      tagType: 'callbackShowStyle'
    }
  },
  { prop: 'create_time', label: '创建时间' },

  // { prop: 'remark', label: '备注' },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' }
];
// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'year', label: '关键词', el: 'input' },

  {
    prop: 'checkTime',
    label: '核对时间',
    el: 'date-picker',
    span: 2,
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  },

];
// 获取table列表
const getTableList = (params: ITeacherStatistics.Query) => {
  let newParams = formatParams(params);
  return getproductListApi(newParams);
};
const formatParams = (params: ITeacherStatistics.Query) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.checkTime && (newParams.checkTimeStart = newParams.checkTime[0]);
  newParams.checkTime && (newParams.checkTimeEnd = newParams.checkTime[1]);
  delete newParams.checkTime;
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
  await useHandleData(removeApi, { ids: [params.id] }, `删除【${params.id}】商品`);
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
    title: '教师统计',
    templateName: '教师统计模板',
    tempApi: downloadTemplate,
    importApi: importTeacherStatisticsExcelApi,
    getTableList: proTableRef.value?.getTableList
  };
  ImportExcelRef.value?.acceptParams(params);
};
// 导出
const downloadFile = async () => {
  ElMessageBox.confirm('确认导出教师统计数据?', '温馨提示', { type: 'warning' }).then(() => {
    let newParams = formatParams(proTableRef.value?.searchParam as ITeacherStatistics.Query);
    useDownload(exportTeacherStatisticsExcelApi, '教师统计', newParams);
  });
};
</script>
