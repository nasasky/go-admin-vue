<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="720px" draggable
    append-to-body>
    <el-form ref="ruleFormRef" label-width="80px" label-suffix=" :" :rules="rules" :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit" class="user-form">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="名称" prop="username">
            <el-input v-model="paramsProps.row.username" placeholder="请填写账户名称" clearable :maxlength="32"
              show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input v-model="paramsProps.row.password" type="password" placeholder="请填写登录密码" clearable
              show-password :maxlength="32" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="paramsProps.row.phone" placeholder="请填写手机号" clearable :maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="paramsProps.row.email" placeholder="请填写邮箱地址" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="角色" prop="role_id">
            <el-select v-model="paramsProps.row.role_id" placeholder="请选择角色" clearable style="width: 100%">
              <el-option v-for="item in roleList" :key="item.id" :label="item.role_name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生日" prop="birthday">
            <el-date-picker v-model="paramsProps.row.birthday" type="date" placeholder="选择生日" value-format="YYYY-MM-DD"
              style="width: 100%" :disabled-date="(date) => date > new Date()" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <el-select v-model="paramsProps.row.sex" placeholder="请选择性别" clearable style="width: 100%">
              <el-option label="未知" :value="0" />
              <el-option label="男" :value="1" />
              <el-option label="女" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="enable">
            <el-radio-group v-model="paramsProps.row.enable">
              <el-radio-button v-for="item in optionsStore.getDictOptions('account_type')" :key="item.code"
                :label="item.code">
                {{ item.codeName }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="头像" prop="logo">
            <UploadImg v-model:image-url="paramsProps.row.logo" @change="fileChange" dir="user" width="120px"
              height="120px" border-radius="50%">
              <template #empty>
                <el-icon>
                  <Avatar />
                </el-icon>
                <span>请上传头像</span>
              </template>
              <template #tip>头像大小不能超过 2M</template>
            </UploadImg>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import UploadImg from '@/components/Upload/Img.vue';
import type { IUploadResult } from '@/api/interface/system/upload';
import { useOptionsStore } from '@/stores/modules/options';
defineOptions({
  name: 'UserAdd'
});
const optionsStore = useOptionsStore();
const rules = reactive({
  username: [
    { required: true, message: '用户名是必填项', trigger: 'blur' },
    { min: 2, max: 32, message: '用户名长度应在2到32个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码是必填项', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度应在6到32个字符之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '手机号是必填项', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱是必填项', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role_id: [
    { required: true, message: '角色是必填项', trigger: 'change' }
  ],
  sex: [
    { required: false, message: '请选择性别', trigger: 'change' }
  ],
  enable: [
    { required: true, message: '请选择账户状态', trigger: 'change' }
  ],
  birthday: [
    { required: false, trigger: 'change' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value) {
          callback();
          return;
        }
        const birthDate = new Date(value);
        const today = new Date();
        const minDate = new Date('1900-01-01');
        
        if (birthDate > today) {
          callback(new Error('生日不能晚于今天'));
        } else if (birthDate < minDate) {
          callback(new Error('生日不能早于1900年'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
});
const roleList = ref([] as any[]);
import { getRoleList } from '@/api/modules/system/role';
const visible = ref(false);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

// 默认表单数据
const defaultFormData = {
  username: '',
  password: '',
  phone: '',
  email: '',
  role_id: undefined,
  sex: 0,
  enable: 1,
  birthday: '',
  logo: ''
};

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = {
    ...params,
    row: { ...defaultFormData, ...params.row }
  };
  visible.value = true;
  getRoleListdata();
};

//获取角色列表
const getRoleListdata = async () => {

  let data = {
    page: 1,
    page_size: 1000,

  };
  getRoleList(data).then(res => {
    roleList.value = res.data.items;
    console.log("ss");
  });

};

const emit = defineEmits(['submit']);

// 重置表单
const resetForm = () => {
  ruleFormRef.value?.resetFields();
  paramsProps.value.row = { ...defaultFormData };
};

// 关闭弹窗
const closeDialog = () => {
  resetForm();
  visible.value = false;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
      paramsProps.value.getTableList!();
      emit('submit');
      closeDialog();
    } catch (error) {
      console.error('提交失败:', error);
    }
  });
};

// 获取文件变更事件
const fileChange = (data: IUploadResult) => {
  console.log(data);
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.user-form {
  :deep(.el-form-item) {
    margin-bottom: 18px;
    .el-form-item__label {
      font-weight: 500;
    }
  }
  :deep(.el-input-number) {
    width: 100%;
  }
  :deep(.el-radio-group) {
    width: 100%;
    display: flex;
    .el-radio-button {
      flex: 1;
      .el-radio-button__inner {
        width: 100%;
      }
    }
  }
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 50%;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}
</style>
