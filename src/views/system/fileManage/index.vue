<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTableRef"
        title="文件管理"
        :indent="20"
        :columns="columns"
        :search-columns="searchColumns"
        :request-api="getTableList"
        :border="false"
        row-key="id"
      >
        <!-- 自定义列插槽 -->
        <template #url="{ row }">
          <div class="file-actions">
            <template v-if="isImage(row.contextType)">
              <el-button type="primary" link @click="handlePreview(row)">
                <el-icon><View /></el-icon>
                预览
              </el-button>
            </template>
            <el-button type="primary" link :href="row.url" target="_blank" :download="row.filename">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
          </div>
        </template>

        <template #response_body="{ row }">
          <el-button type="primary" link @click="showDetail(row)">
            <el-icon><Document /></el-icon>
            查看详情
          </el-button>
        </template>

        <template #status_code="{ row }">
          <el-tag :type="getStatusType(row.status_code)">{{ row.status_code }}</el-tag>
        </template>

        <template #client_ip="{ row }">
          <el-tooltip :content="row.client_ip" placement="top" :show-after="500">
            <span class="ellipsis-text">{{ row.client_ip }}</span>
          </el-tooltip>
        </template>
      </ProTable>

      <!-- 详情弹框 -->
      <el-dialog
        v-model="detailVisible"
        title="响应详情"
        width="800px"
        class="detail-dialog"
        destroy-on-close
        :close-on-click-modal="false"
      >
        <div class="detail-content">
          <div class="detail-item">
            <div class="item-label">访问接口地址：</div>
            <div class="item-value">{{ currentDetail.path || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">请求参数：</div>
            <div class="item-value">
              <div class="code-block">
                <pre v-if="currentDetail.request_params">{{ formatJson(currentDetail.request_params) }}</pre>
                <span v-else>-</span>
              </div>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">返回参数：</div>
            <div class="item-value">
              <div class="code-block">
                <pre v-if="currentDetail.response_body">{{ formatJson(currentDetail.response_body) }}</pre>
                <span v-else>-</span>
              </div>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">Message：</div>
            <div class="item-value">{{ currentDetail.response_message || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">访问用户：</div>
            <div class="item-value">{{ currentDetail.username || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">IP地址：</div>
            <div class="item-value">{{ currentDetail.client_ip || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">访问时间：</div>
            <div class="item-value">{{ currentDetail.timestamp || '-' }}</div>
          </div>
        </div>
      </el-dialog>

      <!-- 图片预览 -->
      <el-image-viewer 
        v-if="previewVisible" 
        :url-list="[previewUrl]" 
        :initial-index="0"
        @close="previewVisible = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProTable from '@/components/ProTable/index.vue';
import { getSysFileListApi } from '@/api/modules/system/file';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { ISysFile } from '@/api/interface/system/file';
import { useOptionsStore } from '@/stores/modules/options';
import { View, Download, Document } from '@element-plus/icons-vue';
import { ElImageViewer } from 'element-plus';

defineOptions({
  name: 'SysFileView'
});

const optionsStore = useOptionsStore();
const proTableRef = ref<ProTableInstance>();

// 表格配置项
const columns: ColumnProps<ISysFile.Row>[] = [
  { prop: 'path', label: '访问接口地址', width: 200 },
  { prop: 'request_params', label: '请求参数', width: 120, showOverflowTooltip: true },
  { prop: 'status_code', label: '状态码', width: 100 },
  { prop: 'response_message', label: 'Message', width: 120, showOverflowTooltip: true },
  { prop: 'response_body', label: '返回参数', width: 120 },
  { prop: 'client_ip', label: 'IP地址', width: 140 },
  { prop: 'timestamp', label: '访问时间', width: 180 },
  { prop: 'username', label: '访问用户', width: 120 },
  { prop: 'url', label: '操作', width: 120, fixed: 'right' }
];

// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'filename', label: '文件名', el: 'input' },
  { prop: 'username', label: '访问用户', el: 'input' },
  { prop: 'path', label: '接口地址', el: 'input' },
  {
    prop: 'timestamp',
    label: '访问时间',
    el: 'date-picker',
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 获取table列表
const getTableList = (params: ISysFile.Query) => {
  let newParams = formatParams(params);
  return getSysFileListApi(newParams);
};

const formatParams = (params: ISysFile.Query) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.timestamp) {
    newParams.createTimeStart = newParams.timestamp[0];
    newParams.createTimeEnd = newParams.timestamp[1];
    delete newParams.timestamp;
  }
  return newParams;
};

// 是否是图片
const isImage = (contextType: string) => {
  const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp', 'image/svg+xml'];
  return imageMimeTypes.includes(contextType);
};

// 获取状态码类型
const getStatusType = (status: number) => {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'warning';
  if (status >= 400) return 'danger';
  return 'info';
};

// 详情弹框
const detailVisible = ref(false);
const currentDetail = ref<ISysFile.Row>({});

const showDetail = (row: ISysFile.Row) => {
  currentDetail.value = row;
  detailVisible.value = true;
};

// 格式化JSON显示
const formatJson = (json: string) => {
  try {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return json;
  }
};

// 图片预览
const previewVisible = ref(false);
const previewUrl = ref('');

const handlePreview = (row: ISysFile.Row) => {
  previewUrl.value = row.url;
  previewVisible.value = true;
};
</script>

<style scoped lang="scss">
.main-box {
  .file-actions {
    display: flex;
    gap: 16px;
    
    .el-icon {
      margin-right: 4px;
    }
  }

  :deep(.el-tag) {
    width: 60px;
    text-align: center;
  }

  .ellipsis-text {
    display: inline-block;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.detail-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .detail-content {
    .detail-item {
      display: flex;
      margin-bottom: 20px;
      align-items: flex-start;

      &:last-child {
        margin-bottom: 0;
      }

      .item-label {
        min-width: 120px;
        padding-right: 16px;
        color: #606266;
        font-weight: 500;
        line-height: 1.5;
      }

      .item-value {
        flex: 1;
        min-width: 0;
        word-break: break-all;
        line-height: 1.5;
        color: #333;

        .code-block {
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 12px;
          margin: 0;
          
          pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
          }
        }
      }
    }
  }
}
</style>
