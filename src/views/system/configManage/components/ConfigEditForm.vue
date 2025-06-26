<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="580px" draggable
    append-to-body>
    <el-form ref="ruleFormRef" label-width="100px" label-suffix=" :" :rules="rules" :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit">

      <el-form-item label="类型" prop="type" >
        <el-select v-model="paramsProps.row.type" clearable placeholder="请选择类型">
          <el-option v-for="item in optionsStore.getDictOptions('system_parameter')" :key="item.code" :label="item.codeName"
            :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="参数名称" prop="name">
        <el-input :disabled="paramsProps.row.isLock === 'T'" v-model="paramsProps.row.name" placeholder="请填写参数名称"
          clearable />
      </el-form-item>
      <el-form-item label="Appid" prop="appid">
        <el-input :disabled="paramsProps.row.isLock === 'T'" v-model="paramsProps.row.appid" placeholder="请填写Appid"
          clearable />
      </el-form-item>
      <el-form-item label="SecretKey" prop="secret">
        <el-input v-model="paramsProps.row.secret" placeholder="请填写SecretKey" clearable />
      </el-form-item>
      <el-form-item label="备注" prop="tips">
        <el-input v-model="paramsProps.row.tips" placeholder="请填写备注" :rows="2" type="textarea" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useOptionsStore } from '@/stores/modules/options';
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { IS_PREVIEW } from '@/config';

defineOptions({
  name: 'DictTypeForm'
});
const optionsStore = useOptionsStore();
const rules = reactive({
  type: [{ required: true, message: '请选择类型', trigger: 'blur' }],
  name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
  appid: [{ required: true, message: '请输入Key', trigger: 'blur' }],
  secret: [{ required: true, message: '请输入Value', trigger: 'blur' }]
});

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
};

// 提交数据（新增/编辑）
const ruleFormRef = ref();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid: boolean) => {
    if (!valid) return;
    if (IS_PREVIEW) {
      return ElMessage.warning({ message: '预览环境，禁止修改初始密码，请谅解！' });
    }
    try {
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
      paramsProps.value.getTableList!();
      visible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss"></style>
