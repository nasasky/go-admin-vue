<template>
  <el-dialog
    v-model="visible"
    :title="`${paramsProps.title}`"
    :destroy-on-close="true"
    width="80%"
    :max-width="900"
    draggable
    class="store-form-dialog"
  >
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
      class="store-form"
    >
      <!-- 基本信息区域 -->
      <div class="form-section">
        <div class="section-title">
          <el-icon><Shop /></el-icon>
          <span>基本信息</span>
        </div>
        <div class="form-main">
          <div class="form-left">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="店铺名称" prop="store_name">
                  <el-input
                    v-model="paramsProps.row.store_name"
                    placeholder="请填写店铺名称"
                    clearable
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="负责人" prop="manager">
                  <el-select 
                    v-model="paramsProps.row.manager" 
                    placeholder="请选择负责人"
                    filterable
                    remote
                    :remote-method="searchUsers"
                    :loading="userLoading"
                    style="width: 100%"
                    @change="handleManagerChange"
                  >
                    <el-option
                      v-for="user in userList"
                      :key="user.id"
                      :label="`${user.nickname || user.username} (${user.username})`"
                      :value="user.username"
                      :data-user="user"
                    >
                      <div style="display: flex; align-items: center;">
                        <el-avatar 
                          :size="24" 
                          :src="user.logo || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                          style="margin-right: 8px;"
                        />
                        <span>{{ user.nickname || user.username }}</span>
                        <span style="color: #999; margin-left: 8px;">({{ user.username }})</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="负责人ID" prop="manager_id">
                  <el-input-number
                    v-model="paramsProps.row.manager_id"
                    :precision="0"
                    :min="1"
                    :max="999999"
                    placeholder="请填写负责人ID"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="phone">
                  <el-input
                    v-model="paramsProps.row.phone"
                    placeholder="请填写联系电话"
                    clearable
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="店铺地址" prop="address">
              <el-input
                v-model="paramsProps.row.address"
                placeholder="请填写店铺详细地址"
                clearable
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-select v-model="paramsProps.row.status" clearable placeholder="请选择状态" style="width: 100%">
                    <el-option label="启用" :value="1">
                      <el-icon><CircleCheck /></el-icon>
                      <span style="margin-left: 8px">启用</span>
                    </el-option>
                    <el-option label="禁用" :value="0">
                      <el-icon><CircleClose /></el-icon>
                      <span style="margin-left: 8px">禁用</span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="店铺Logo" prop="logo">
                  <div class="logo-upload-container">
                    <UploadImg 
                      v-model:image-url="paramsProps.row.logo" 
                      @change="fileChange" 
                      dir="store"
                      width="120px"
                      height="120px"
                      :border-radius="'8px'"
                    >
                      <template #empty>
                        <div class="upload-empty-content">
                          <el-icon class="upload-icon"><Plus /></el-icon>
                          <span class="upload-text">上传Logo</span>
                        </div>
                      </template>
                      <template #tip>
                        <div class="upload-tip">
                          <p>建议尺寸：200x200px</p>
                          <p>支持格式：JPG、PNG、GIF</p>
                          <p>文件大小：不超过2M</p>
                        </div>
                      </template>
                    </UploadImg>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <!-- 店铺描述区域 -->
      <div class="form-section">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          <span>店铺描述</span>
        </div>
        <el-form-item label="店铺描述" prop="description">
          <el-input
            v-model="paramsProps.row.description"
            placeholder="请填写店铺描述信息，如店铺特色、服务内容等"
            :rows="4"
            type="textarea"
            clearable
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </div>

      <!-- 营业时间区域 -->
      <div class="form-section">
        <div class="section-title">
          <el-icon><Clock /></el-icon>
          <span>营业时间</span>
          <el-button 
            type="primary" 
            size="small" 
            @click="addBusinessHour"
            class="add-time-btn"
          >
            <el-icon><Plus /></el-icon>
            添加时间
          </el-button>
        </div>
        
        <div class="business-hours-container">
          <div class="business-hours-header">
            <span class="header-day">星期</span>
            <span class="header-time">开始时间</span>
            <span class="header-time">结束时间</span>
            <span class="header-status">营业状态</span>
            <span class="header-action">操作</span>
          </div>
          
          <div class="business-hours-list">
            <div 
              v-for="(item, index) in businessHours" 
              :key="index" 
              class="business-hours-item"
            >
              <div class="time-select">
                <el-select v-model="item.day" placeholder="选择星期" style="width: 90px">
                  <el-option label="周一" value="周一" />
                  <el-option label="周二" value="周二" />
                  <el-option label="周三" value="周三" />
                  <el-option label="周四" value="周四" />
                  <el-option label="周五" value="周五" />
                  <el-option label="周六" value="周六" />
                  <el-option label="周日" value="周日" />
                </el-select>
              </div>
              
              <div class="time-picker">
                <el-time-picker
                  v-model="item.start_time"
                  placeholder="开始时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  style="width: 110px"
                />
              </div>
              
              <div class="time-picker">
                <el-time-picker
                  v-model="item.end_time"
                  placeholder="结束时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  style="width: 110px"
                />
              </div>
              
              <div class="status-switch">
                <el-switch 
                  v-model="item.is_open" 
                  active-text="营业"
                  inactive-text="休息"
                  active-color="#67c23a"
                  inactive-color="#f56c6c"
                />
              </div>
              
              <div class="action-btn">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeBusinessHour(index)"
                  :icon="Delete"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
          
          <div v-if="businessHours.length === 0" class="empty-hours">
            <el-empty description="暂无营业时间设置" :image-size="60">
              <el-button type="primary" @click="addBusinessHour">添加营业时间</el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, type ElForm } from 'element-plus';
import { 
  Plus, 
  Delete, 
  Shop, 
  Document, 
  Clock, 
  CircleCheck, 
  CircleClose 
} from '@element-plus/icons-vue';
import UploadImg from '@/components/Upload/Img.vue';
import { getUserList } from '@/api/modules/system/user';
import type { IStore } from '@/api/interface/system/store';
import type { IUser } from '@/api/interface/system/user';

defineOptions({
  name: 'StoreForm'
});

const rules = reactive({
  store_name: [
    { required: true, message: '请填写店铺名称', trigger: 'blur' },
    { min: 2, max: 100, message: '店铺名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ],
  manager_id: [
    { required: true, message: '请填写负责人ID', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请填写联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请填写店铺地址', trigger: 'blur' },
    { min: 5, max: 200, message: '店铺地址长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

const visible = ref(false);
const submitLoading = ref(false);
const userLoading = ref(false);
const userList = ref<IUser.Info[]>([]);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

// 营业时间数据
const businessHours = ref<IStore.BusinessHours[]>([]);

// 搜索用户
const searchUsers = async (query: string) => {
  if (query.length < 1) {
    userList.value = [];
    return;
  }
  
  userLoading.value = true;
  try {
    const params = {
      page: 1,
      page_size: 20,
      username: query,
      nickname: query,
      phone: query
    };
    const { data } = await getUserList(params);
    userList.value = data.items || [];
  } catch (error) {
    console.error('获取用户列表失败:', error);
    userList.value = [];
  } finally {
    userLoading.value = false;
  }
};

// 初始化营业时间
const initBusinessHours = () => {
  if (paramsProps.value.row.business_hours && Array.isArray(paramsProps.value.row.business_hours)) {
    businessHours.value = [...paramsProps.value.row.business_hours];
  } else {
    businessHours.value = [];
  }
};

// 添加营业时间
const addBusinessHour = () => {
  businessHours.value.push({
    day: '周一',
    start_time: '09:00',
    end_time: '18:00',
    is_open: true
  });
};

// 删除营业时间
const removeBusinessHour = (index: number) => {
  businessHours.value.splice(index, 1);
};

// 文件上传回调
const fileChange = (fileInfo: any) => {
  console.log('文件上传成功:', fileInfo);
};

// 负责人选择变化时，自动填充负责人ID
const handleManagerChange = (value: string) => {
  const selectedUser = userList.value.find(user => user.username === value);
  if (selectedUser) {
    paramsProps.value.row.manager_id = selectedUser.id;
  }
};

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
  visible.value = true;
  initBusinessHours();
  // 初始化时加载一些用户
  loadInitialUsers();
};

// 加载初始用户列表
const loadInitialUsers = async () => {
  userLoading.value = true;
  try {
    const params = {
      page: 1,
      page_size: 10
    };
    const { data } = await getUserList(params);
    userList.value = data.items || [];
  } catch (error) {
    console.error('获取初始用户列表失败:', error);
    userList.value = [];
  } finally {
    userLoading.value = false;
  }
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    
    submitLoading.value = true;
    
    try {
      // 处理营业时间数据
      paramsProps.value.row.business_hours = businessHours.value;
      
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
      paramsProps.value.getTableList!();
      visible.value = false;
    } catch (error) {
      console.log(error);
    } finally {
      submitLoading.value = false;
    }
  });
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
// 使用系统标准的dialog样式
.store-form-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  :deep(.el-dialog__footer) {
    padding: 15px 30px;
    border-top: 1px solid #e4e7ed;
  }
}

.store-form {
  .form-section {
    margin-bottom: 30px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f2f5;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    
    .el-icon {
      margin-right: 8px;
      color: #409eff;
    }
    
    .add-time-btn {
      margin-left: auto;
    }
  }

  .form-main {
    display: flex;
    gap: 25px;

    .form-left {
      flex: 1;
      min-width: 0; // 防止flex子元素溢出
    }
  }

  .logo-upload-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    
    :deep(.upload-img) {
      max-width: 100% !important;
      max-height: 100% !important;
      width: 120px !important;
      height: 120px !important;
    }
    
    .upload-empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      
      .upload-icon {
        font-size: 24px;
        color: #c0c4cc;
        margin-bottom: 4px;
      }
      
      .upload-text {
        font-size: 11px;
        color: #606266;
      }
    }
    
    .upload-tip {
      margin-top: 4px;
      font-size: 10px;
      color: #909399;
      text-align: center;
      
      p {
        margin: 1px 0;
        line-height: 1.2;
      }
    }
  }

  .business-hours-container {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background-color: #fafbfc;
    overflow: hidden;

    .business-hours-header {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      font-weight: 600;
      color: #606266;
      font-size: 14px;

      .header-day {
        flex: 0 0 90px;
      }
      
      .header-time {
        flex: 1;
        text-align: center;
        min-width: 110px;
      }
      
      .header-status {
        flex: 0 0 100px;
        text-align: center;
      }
      
      .header-action {
        flex: 0 0 70px;
        text-align: center;
      }
    }

    .business-hours-list {
      padding: 0 15px;
    }

    .business-hours-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 12px 0;
      padding: 12px;
      background-color: #fff;
      border-radius: 6px;
      border: 1px solid #e4e7ed;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
      }

      .time-select {
        flex: 0 0 90px;
      }
      
      .time-picker {
        flex: 1;
        min-width: 110px;
      }
      
      .status-switch {
        flex: 0 0 100px;
        text-align: center;
      }
      
      .action-btn {
        flex: 0 0 70px;
        text-align: center;
      }
    }
    
    .empty-hours {
      padding: 30px 15px;
      text-align: center;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式处理
@media (max-width: 768px) {
  .store-form {
    .form-main {
      flex-direction: column;
      gap: 15px;
    }
    
    .logo-upload-container {
      :deep(.upload-img) {
        width: 100px !important;
        height: 100px !important;
      }
    }
    
    .business-hours-container {
      .business-hours-item {
        flex-wrap: wrap;
        gap: 8px;
        
        .time-select,
        .time-picker,
        .status-switch,
        .action-btn {
          flex: 1;
          min-width: auto;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .store-form {
    .logo-upload-container {
      :deep(.upload-img) {
        width: 80px !important;
        height: 80px !important;
      }
    }
  }
}
</style> 