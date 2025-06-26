<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="580px" draggable
    append-to-body>
    <el-form ref="ruleFormRef" label-width="80px" label-suffix=" :" :rules="rules" :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit" class="form__label">
      <el-row>
        <el-col :span="12">
          <el-form-item label="名称" prop="username">
            <template #label>
              <el-space :size="2">
                <span>名称</span>
                <el-tooltip effect="dark" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
              <span>&nbsp;:</span>
            </template>
            <el-input v-model="paramsProps.row.username" placeholder="请填写账户" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="登录密码" prop="password">
            <el-input v-model="paramsProps.row.password" placeholder="请填写登录密码" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="paramsProps.row.phone" placeholder="请填写手机号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="paramsProps.row.email" placeholder="请填写邮箱地址" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="角色" prop="role_id">
            <el-select v-model="paramsProps.row.role_id" clearable placeholder="请选择性别">

              <el-option v-for="item in roleList" :key="item.id" :label="item.role_name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生日" prop="birthday">
            <el-date-picker v-model="paramsProps.row.birthday" type="date" placeholder="选择生日"
              value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <el-select v-model="paramsProps.row.sex" clearable placeholder="请选择性别">
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
                :label="item.codeName" :value="item.code" />
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-form-item label="头像" prop="logo">
          <UploadImg v-model:image-url="paramsProps.row.logo" @change="fileChange" dir="user" width="135px"
            height="135px" border-radius="50%">
            <template #empty>
              <el-icon>
                <Avatar />
              </el-icon>
              <span>请上传头像</span>
            </template>
            <template #tip> 头像大小不能超过 3M </template>
          </UploadImg>
        </el-form-item>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
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
    { min: 3, max: 32, message: '用户名长度应在3到32个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: Function) => {
        if (/^\d+$/.test(value)) callback(new Error('用户名不能为纯数字'));
        else callback();
      }, 
      trigger: 'blur' 
    }
  ],
  password: [
    { required: true, message: '密码是必填项', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度应在6到32个字符之间', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: Function) => {
        // 至少包含一个大写字母、小写字母、数字和特殊字符
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
        if (!strongRegex.test(value)) {
          callback(new Error('密码必须包含大小写字母、数字和特殊字符'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
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
    { required: true, message: '角色是必填项', trigger: 'change' },
    {
      validator: (rule: any, value: any, callback: Function) => {
        if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
          callback(new Error('请选择有效的角色'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  sex: [
    { required: false, message: '请选择性别', trigger: 'change' },
    {
      validator: (rule: any, value: any, callback: Function) => {
        if (value !== undefined && ![0, 1, 2].includes(Number(value))) {
          callback(new Error('性别选择无效'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  enable: [
    { required: true, message: '请选择账户状态', trigger: 'change' }
  ],
  birthday: [
    { required: false, trigger: 'change' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          if (birthDate > today) {
            callback(new Error('生日不能晚于今天'));
          } else if (birthDate.getFullYear() < 1900) {
            callback(new Error('生日年份不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  logo: [
    { required: false, message: '请上传头像', trigger: 'change' }
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

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
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
      visible.value = false;
    } catch (error) {
      console.log(error);
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

<style scoped lang="scss"></style>
