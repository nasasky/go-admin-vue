<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable
        ref="proTableRef"
        title="推送消息记录"
        :indent="20"
        :columns="columns"
        :search-columns="searchColumns"
        :request-api="getTableList"
        :border="false"
        row-key="id"
      >
        <!-- 自定义列插槽 -->
        <template #content="{ row }">
          <el-tooltip :content="row.content" placement="top" :show-after="500">
            <span class="ellipsis-text">{{ row.content }}</span>
          </el-tooltip>
        </template>

        <template #message_type="{ row }">
          <el-tag :type="getMessageTypeColor(row.message_type || '')">
            {{ getMessageTypeText(row.message_type || '') }}
          </el-tag>
        </template>

        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status || '')">
            {{ getStatusText(row.status || '') }}
          </el-tag>
        </template>

        <template #success="{ row }">
          <el-tag :type="row.success ? 'success' : 'danger'">
            {{ row.success ? '成功' : '失败' }}
          </el-tag>
        </template>

        <template #priority="{ row }">
          <el-tag :type="getPriorityType(row.priority || 1)">
            {{ getPriorityText(row.priority || 1) }}
          </el-tag>
        </template>

        <template #need_confirm="{ row }">
          <el-tag :type="row.need_confirm ? 'warning' : 'info'">
            {{ row.need_confirm ? '是' : '否' }}
          </el-tag>
        </template>

        <!-- 操作列 -->
        <template #operation="{ row }">
          <el-button type="primary" link @click="showDetail(row)">
            <el-icon><View /></el-icon>
            查看
          </el-button>
        </template>
      </ProTable>

      <!-- 详情弹框 -->
      <el-dialog
        v-model="detailVisible"
        title="推送消息详情"
        width="800px"
        class="detail-dialog"
        destroy-on-close
        :close-on-click-modal="false"
      >
        <div class="detail-content">
          <div class="detail-item">
            <div class="item-label">记录ID：</div>
            <div class="item-value">{{ currentDetail.id || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">消息ID：</div>
            <div class="item-value">{{ currentDetail.message_id || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">消息内容：</div>
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
            <div class="item-label">发送人：</div>
            <div class="item-value">{{ currentDetail.sender_name || '-' }}</div>
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
          <!-- <div class="detail-item">
            <div class="item-label">送达数量：</div>
            <div class="item-value">{{ currentDetail.delivered_count || 0 }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">失败数量：</div>
            <div class="item-value">{{ currentDetail.failed_count || 0 }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">总数量：</div>
            <div class="item-value">{{ currentDetail.total_count || 0 }}</div>
          </div> -->
          <div class="detail-item">
            <div class="item-label">优先级：</div>
            <div class="item-value">
              <el-tag :type="getPriorityType(currentDetail.priority || 1)">
                {{ getPriorityText(currentDetail.priority || 1) }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">需确认：</div>
            <div class="item-value">
              <el-tag :type="currentDetail.need_confirm ? 'warning' : 'info'">
                {{ currentDetail.need_confirm ? '是' : '否' }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">推送时间：</div>
            <div class="item-value">{{ currentDetail.push_time || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">创建时间：</div>
            <div class="item-value">{{ currentDetail.created_at || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">更新时间：</div>
            <div class="item-value">{{ currentDetail.updated_at || '-' }}</div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProTable from '@/components/ProTable/index.vue';
import { getUserNotificationListApi, getUserNotificationDetailApi } from '@/api/modules/system/userNotification';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { IUserNotificationQuery, IUserNotificationRow } from '@/api/interface/system/userNotification';
import { View } from '@element-plus/icons-vue';

defineOptions({
  name: 'AdminReceiveRecordView'
});

const proTableRef = ref<ProTableInstance>();

// 表格配置项
const columns: ColumnProps<IUserNotificationRow>[] = [
  { prop: 'id', label: '记录ID', showOverflowTooltip: true },
  { prop: 'message_id', label: '消息ID', showOverflowTooltip: true },
  { prop: 'content', label: '消息内容', showOverflowTooltip: true },
  { prop: 'message_type', label: '消息类型' },
  { prop: 'sender_name', label: '发送人', showOverflowTooltip: true },
  // { prop: 'status', label: '推送状态' },
  { prop: 'success', label: '推送结果' },
  // { prop: 'delivered_count', label: '送达数量' },
  // { prop: 'failed_count', label: '失败数量' },
  // { prop: 'total_count', label: '总数量' },
  { prop: 'priority', label: '优先级' },
  { prop: 'need_confirm', label: '需确认' },
  { prop: 'push_time', label: '推送时间' ,width: 180},
  // { prop: 'created_at', label: '创建时间' },
  { prop: 'operation', label: '操作', width: 100, fixed: 'right' }
];

// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'message_id', label: '消息ID', el: 'input' },
  { prop: 'content', label: '消息内容', el: 'input' },
  { prop: 'message_type', label: '消息类型', el: 'select', enum: [
    { label: '系统通知', value: 'system_notice' },
    { label: '系统维护', value: 'system_maintain' },
    { label: '系统升级', value: 'system_upgrade' },
    { label: '订单创建', value: 'order_created' },
    { label: '订单支付', value: 'order_paid' },
    { label: '订单取消', value: 'order_cancelled' }
  ]},
  { prop: 'sender_name', label: '发送人', el: 'input' },
  { prop: 'status', label: '推送状态', el: 'select', enum: [
    { label: '在线', value: 'online' },
    { label: '离线', value: 'offline' },
    { label: '已送达', value: 'delivered' },
    { label: '发送失败', value: 'failed' },
    { label: '待发送', value: 'pending' }
  ]},
  { prop: 'success', label: '推送结果', el: 'select', enum: [
    { label: '成功', value: 'true' },
    { label: '失败', value: 'false' }
  ]},
  { prop: 'priority', label: '优先级', el: 'select', enum: [
    { label: '低', value: '0' },
    { label: '普通', value: '1' },
    { label: '高', value: '2' },
    { label: '紧急', value: '3' }
  ]},
  { prop: 'need_confirm', label: '需确认', el: 'select', enum: [
    { label: '是', value: 'true' },
    { label: '否', value: 'false' }
  ]},
  {
    prop: 'start_date',
    label: '开始日期',
    el: 'date-picker',
    props: {
      type: 'datetime',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  {
    prop: 'end_date',
    label: '结束日期',
    el: 'date-picker',
    props: {
      type: 'datetime',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

// 获取table列表
const getTableList = (params: IUserNotificationQuery) => {
  return getUserNotificationListApi(params);
};

// 获取消息类型颜色
const getMessageTypeColor = (type: string) => {
  switch (type) {
    case 'system_notice': return 'primary';
    case 'order_notice': return 'warning';
    case 'user_notice': return 'info';
    case 'activity_notice': return 'success';
    default: return 'info';
  }
};

// 获取消息类型文本
const getMessageTypeText = (type: string) => {
  switch (type) {
    case 'system_notice': return '系统通知';
    case 'system_maintain': return '系统维护';
    case 'system_upgrade': return '系统升级';
    case 'order_created': return '订单创建';
    case 'order_paid': return '订单支付';
    case 'order_cancelled': return '订单取消';
    default: return type;
  }
};

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'online': return 'success';
    case 'offline': return 'info';
    case 'delivered': return 'success';
    case 'failed': return 'danger';
    case 'pending': return 'warning';
    default: return 'info';
  }
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return '在线';
    case 'offline': return '离线';
    case 'delivered': return '已送达';
    case 'failed': return '发送失败';
    case 'pending': return '待发送';
    default: return status;
  }
};

// 获取优先级类型
const getPriorityType = (priority: number) => {
  switch (priority) {
    case 0: return 'info';
    case 1: return 'primary';
    case 2: return 'warning';
    case 3: return 'danger';
    default: return 'primary';
  }
};

// 获取优先级文本
const getPriorityText = (priority: number) => {
  switch (priority) {
    case 0: return '低';
    case 1: return '普通';
    case 2: return '高';
    case 3: return '紧急';
    default: return '普通';
  }
};

// 详情弹框
const detailVisible = ref(false);
const currentDetail = ref<IUserNotificationRow>({});

const showDetail = async (row: IUserNotificationRow) => {
  if (row.id) {
    try {
      const response = await getUserNotificationDetailApi({ id: row.id });
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
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
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
