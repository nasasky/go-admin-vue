<template>
  <div class="table-box">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="card-title">平台信息设置</span>
        </div>
      </template>
      
      <el-form
        ref="storeFormRef"
        :model="storeForm"
        :rules="storeRules"
        label-width="100px"
        label-suffix=":"
        class="store-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="店铺名称" prop="storeName">
              <el-input
                v-model="storeForm.storeName"
                placeholder="请输入店铺名称"
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="店铺负责人" prop="manager">
              <el-input
                v-model="storeForm.manager"
                placeholder="请输入店铺负责人"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系手机号" prop="phone">
              <el-input
                v-model="storeForm.phone"
                placeholder="请输入联系手机号"
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="店铺位置" prop="address">
              <el-input
                v-model="storeForm.address"
                placeholder="请输入店铺位置"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营业时间" prop="businessHours">
              <el-time-picker
                v-model="storeForm.businessHours"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择营业时间"
                format="HH:mm"
                value-format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="店铺Logo" prop="logo">
              <UploadImg
                v-model:image-url="storeForm.logo"
                @change="logoChange"
                dir="store"
                width="120px"
                height="120px"
              >
                <template #empty>
                  <el-icon><Plus /></el-icon>
                  <span>请上传店铺Logo</span>
                </template>
                <template #tip>
                  建议尺寸 200x200px，支持 jpg、png 格式，大小不超过 2M
                </template>
              </UploadImg>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="店铺介绍" prop="description">
              <el-input
                v-model="storeForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入店铺介绍"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <div class="form-actions">
              <el-button @click="resetForm">重置</el-button>
              <el-button type="primary" @click="saveStoreInfo" :loading="saveLoading">
                保存设置
              </el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance } from 'element-plus';
import UploadImg from '@/components/Upload/Img.vue';
import type { IUpload } from '@/api/interface/system/upload';
import { getStoreInfo as getStoreInfoApi, saveStoreInfo as saveStoreInfoApi, updateStoreInfo as updateStoreInfoApi } from '@/api/modules/catMall/store';
import type { IStore } from '@/api/interface/catMall/store';

type IUploadResult = IUpload.UploadResult;

defineOptions({
  name: 'StoreInfo'
});

// 表单引用
const storeFormRef = ref<FormInstance>();
const saveLoading = ref(false);

// 店铺信息表单数据
interface StoreFormData {
  storeName: string;
  manager: string;
  phone: string;
  address: string;
  businessHours: string[];
  logo: string;
  description: string;
}

const storeForm = reactive<StoreFormData>({
  storeName: '',
  manager: '',
  phone: '',
  address: '',
  businessHours: [],
  logo: '',
  description: ''
});

// 表单验证规则
const storeRules = {
  storeName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 50, message: '店铺名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请输入店铺负责人', trigger: 'blur' },
    { min: 2, max: 20, message: '负责人姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入店铺位置', trigger: 'blur' },
    { min: 5, max: 100, message: '店铺位置长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  businessHours: [
    { required: true, message: '请选择营业时间', trigger: 'change' }
  ]
};

// Logo 变更处理
const logoChange = (uploadResult: IUploadResult | null) => {
  if (uploadResult) {
    storeForm.logo = uploadResult.url || '';
  }
};

// 保存店铺信息
const saveStoreInfo = async () => {
  if (!storeFormRef.value) return;
  
  try {
    const valid = await storeFormRef.value.validate();
    if (!valid) return;
    
    saveLoading.value = true;
    
    const params: IStore.SaveParams = {
      storeName: storeForm.storeName,
      manager: storeForm.manager,
      phone: storeForm.phone,
      address: storeForm.address,
      businessHours: storeForm.businessHours,
      logo: storeForm.logo,
      description: storeForm.description
    };
    
    // 调用保存API
    await saveStoreInfoApi(params);
    
    ElMessage.success('店铺信息保存成功！');
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请重试！');
  } finally {
    saveLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  if (!storeFormRef.value) return;
  
  storeFormRef.value.resetFields();
  storeForm.logo = '';
};

// 加载店铺信息
const loadStoreInfo = async () => {
  try {
    // 调用获取店铺信息API
    const { data } = await getStoreInfoApi();
    
    if (data) {
      Object.assign(storeForm, {
        storeName: data.storeName || '',
        manager: data.manager || '',
        phone: data.phone || '',
        address: data.address || '',
        businessHours: data.businessHours || [],
        logo: data.logo || '',
        description: data.description || ''
      });
    }
  } catch (error) {
    console.error('加载店铺信息失败:', error);
    // 如果是首次访问（404错误），使用默认数据
    const mockData = {
      storeName: '',
      manager: '',
      phone: '',
      address: '',
      businessHours: [],
      logo: '',
      description: ''
    };
    Object.assign(storeForm, mockData);
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadStoreInfo();
});
</script>

<style scoped lang="scss">
.table-box {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  .store-form {
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-light);
    }
  }
  
  // 上传组件样式优化
  :deep(.upload-box) {
    .upload-image {
      border-radius: 6px;
    }
    
    .upload-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: var(--el-text-color-placeholder);
      
      .el-icon {
        font-size: 20px;
      }
    }
    
    .upload-tip {
      margin-top: 6px;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
      line-height: 1.4;
    }
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    .store-form {
      :deep(.el-col) {
        width: 100% !important;
        flex: 0 0 100% !important;
        max-width: 100% !important;
      }
    }
  }
}
</style>