<template>
  <div class="table-box">
    <ProTable ref="proTableRef" title="文件管理" :indent="20" :columns="columns" :search-columns="searchColumns"
      :request-api="getTableList" row-key="id">
      <template #url="{ row }">
        <a :href="row.url" target="_blank" :download="row.filename">{{ isImage(row.contextType) ? '预览' : '下载' }}</a>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProTable from '@/components/ProTable/index.vue';
import { getUserFileListApi } from '@/api/modules/system/file';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { ISysFile } from '@/api/interface/system/file';
import { useOptionsStore } from '@/stores/modules/options';
defineOptions({
  name: 'SysFileView'
});
const optionsStore = useOptionsStore();
const proTableRef = ref<ProTableInstance>();
// 表格配置项
const columns: ColumnProps<ISysFile.Row>[] = [


  { prop: 'path', label: '访问接口地址' },
  { prop: 'request_params', label: '请求参数' },
  { prop: 'status_code', label: '状态码' },
  { prop: 'response_message', label: 'Message' },
  { prop: 'response_body', label: '返回参数' },
  { prop: 'client_ip', label: 'IP地址', width: 120 },
  { prop: 'timestamp', label: '访问时间', width: 185 },
  { prop: 'username', label: '访问用户', width: 165 },
];
// 搜索条件项
const searchColumns: SearchProps[] = [{ prop: 'filename', label: '文件名', el: 'input' }];
// 获取table列表
const getTableList = (params: ISysFile.Query) => {
  let newParams = formatParams(params);
  return getUserFileListApi(newParams);
};
const formatParams = (params: ISysFile.Query) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.createTimeStart = newParams.createTime[0]);
  newParams.createTime && (newParams.createTimeEnd = newParams.createTime[1]);
  delete newParams.createTime;
  return newParams;
};
// 是否是图片
const isImage = (contextType: string) => {
  console.log('contextType', contextType);
  const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp', 'image/svg+xml'];
  return imageMimeTypes.includes(contextType);
};
</script>
