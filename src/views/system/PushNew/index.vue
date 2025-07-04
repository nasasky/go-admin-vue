<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTableRef"
        title="推送日志"
        :indent="20"
        :columns="columns"
        :search-columns="searchColumns"
        :request-api="getTableList"
        :border="false"
        row-key="id"
      >
        <!-- 自定义列插槽 -->
        <template #content="{ row }">
          <el-button type="primary" link @click="showDetail(row)">
            <el-icon><Document /></el-icon>
            查看详情
          </el-button>
        </template>

        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status || '')">{{ getStatusText(row.status || '') }}</el-tag>
        </template>

        <template #success="{ row }">
          <el-tag :type="row.success ? 'success' : 'danger'">
            {{ row.success ? '成功' : '失败' }}
          </el-tag>
        </template>

        <template #message_type="{ row }">
          <el-tag :type="getMessageTypeColor(row.message_type || '')">
            {{ getMessageTypeText(row.message_type || '') }}
          </el-tag>
        </template>

        <template #target="{ row }">
          <el-tag :type="getTargetTypeColor(row.target || '')">
            {{ getTargetText(row.target || '') }}
          </el-tag>
        </template>
      </ProTable>

      <!-- 详情弹框 -->
      <el-dialog
        v-model="detailVisible"
        title="推送详情"
        width="800px"
        class="detail-dialog"
        destroy-on-close
        :close-on-click-modal="false"
      >
        <div class="detail-content">
          <div class="detail-item">
            <div class="item-label">消息ID：</div>
            <div class="item-value">{{ currentDetail.message_id || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">推送内容：</div>
            <div class="item-value">{{ currentDetail.content || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">消息类型：</div>
            <div class="item-value">
              <el-tag :type="getMessageTypeColor(currentDetail.message_type || '')">
                {{ getMessageTypeText(currentDetail.message_type || '') }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">推送目标：</div>
            <div class="item-value">
              <el-tag :type="getTargetTypeColor(currentDetail.target || '')">
                {{ getTargetText(currentDetail.target || '') }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">接收人数：</div>
            <div class="item-value">{{ currentDetail.recipients_count || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">推送状态：</div>
            <div class="item-value">
              <el-tag :type="getStatusType(currentDetail.status || '')">
                {{ getStatusText(currentDetail.status || '') }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">推送结果：</div>
            <div class="item-value">
              <el-tag :type="currentDetail.success ? 'success' : 'danger'">
                {{ currentDetail.success ? '成功' : '失败' }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">推送时间：</div>
            <div class="item-value">{{ currentDetail.push_time || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">发送人：</div>
            <div class="item-value">{{ currentDetail.sender_name || '-' }}</div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProTable from '@/components/ProTable/index.vue';
import { getPushRecordListApi, getPushRecordDetailApi } from '@/api/modules/system/pushRecord';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { IPushRecordQuery, IPushRecordRow } from '@/api/interface/system/pushRecord';
import { Document } from '@element-plus/icons-vue';

defineOptions({
  name: 'PushRecordView'
});

const proTableRef = ref<ProTableInstance>();

// 表格配置项
const columns: ColumnProps<IPushRecordRow>[] = [
  { prop: 'id', label: '消息ID', showOverflowTooltip: true },
  { prop: 'content', label: '推送内容', showOverflowTooltip: true },
  { prop: 'message_type', label: '消息类型' },
  { prop: 'target', label: '推送目标' },
  { prop: 'recipients_count', label: '接收人数', showOverflowTooltip: true },
  { prop: 'status', label: '推送状态' },
  { prop: 'success', label: '推送结果' },
  { prop: 'push_time', label: '推送时间' },
  { prop: 'sender_name', label: '发送人' }
];

// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'message_type', label: '消息类型', el: 'select', enum: [
    { label: '系统通知', value: 'system_notice' },
    { label: '订单通知', value: 'order_notice' },
    { label: '用户通知', value: 'user_notice' }
  ]},
  { prop: 'target', label: '推送目标', el: 'select', enum: [
    { label: '全部用户', value: 'all' },
    { label: '指定用户', value: 'specific' },
    { label: '在线用户', value: 'online' }
  ]},
  { prop: 'status', label: '推送状态', el: 'select', enum: [
    { label: '已发送', value: 'delivered' },
    { label: '发送中', value: 'sending' },
    { label: '发送失败', value: 'failed' }
  ]},
  { prop: 'sender_name', label: '发送人', el: 'input' },
  {
    prop: 'push_time',
    label: '推送时间',
    el: 'date-picker',
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 获取table列表
const getTableList = (params: IPushRecordQuery) => {
  let newParams = formatParams(params);
  return getPushRecordListApi(newParams);
};

const formatParams = (params: IPushRecordQuery) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.push_time) {
    newParams.createTimeStart = newParams.push_time[0];
    newParams.createTimeEnd = newParams.push_time[1];
    delete newParams.push_time;
  }
  return newParams;
};

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'delivered': return 'success';
    case 'sending': return 'warning';
    case 'failed': return 'danger';
    default: return 'info';
  }
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'delivered': return '已发送';
    case 'sending': return '发送中';
    case 'failed': return '发送失败';
    default: return status;
  }
};

// 获取消息类型颜色
const getMessageTypeColor = (type: string) => {
  switch (type) {
    case 'system_notice': return 'primary';
    case 'order_notice': return 'warning';
    case 'user_notice': return 'info';
    default: return 'info';
  }
};

// 获取消息类型文本
const getMessageTypeText = (type: string) => {
  switch (type) {
    case 'system_notice': return '系统通知';
    case 'order_notice': return '订单通知';
    case 'user_notice': return '用户通知';
    default: return type;
  }
};

// 获取目标类型颜色
const getTargetTypeColor = (target: string) => {
  switch (target) {
    case 'all': return 'success';
    case 'specific': return 'warning';
    case 'online': return 'info';
    default: return 'info';
  }
};

// 获取目标文本
const getTargetText = (target: string) => {
  switch (target) {
    case 'all': return '全部用户';
    case 'specific': return '指定用户';
    case 'online': return '在线用户';
    default: return target;
  }
};

// 详情弹框
const detailVisible = ref(false);
const currentDetail = ref<IPushRecordRow>({});

const showDetail = async (row: IPushRecordRow) => {
  if (row.id) {
    try {
      const response = await getPushRecordDetailApi({ id: row.id });
      currentDetail.value = response.data.record;
    } catch (error) {
      console.error('获取详情失败:', error);
      currentDetail.value = row;
    }
  } else {
    currentDetail.value = row;
  }
  detailVisible.value = true;
};
</script>

<style scoped lang="scss">
.main-box {
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
