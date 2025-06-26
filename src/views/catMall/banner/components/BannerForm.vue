<template>
  <el-dialog
    v-model="visible"
    :title="`${paramsProps.title}`"
    :destroy-on-close="true"
    width="580px"
    draggable
  >
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="paramsProps.row.title"
          placeholder="请输入轮播图标题"
          clearable
        />
      </el-form-item>

      <el-form-item label="轮播图" prop="image_url">
        <UploadImg 
          v-model:image-url="paramsProps.row.image_url" 
          @change="fileChange" 
          dir="banner"
          width="350px"
          height="200px"
        >
          <template #empty>
            <el-icon><Plus /></el-icon>
            <span>请上传轮播图</span>
          </template>
          <template #tip>建议尺寸 1920x600px，大小不超过 2M</template>
        </UploadImg>
      </el-form-item>

      <el-form-item label="链接地址" prop="link_url">
        <el-input
          v-model="paramsProps.row.link_url"
          placeholder="请输入链接地址"
          clearable
        />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="paramsProps.row.sort"
          :min="0"
          :max="999"
          placeholder="请输入排序号"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="paramsProps.row.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import UploadImg from '@/components/Upload/Img.vue';
import type { IUploadResult } from '@/api/interface/system/upload';

defineOptions({
  name: 'BannerForm'
});

interface BannerForm {
  title: string;
  image_url: string;
  link_url: string;
  sort: number;
  status: number;
}

const visible = ref(false);
const ruleFormRef = ref<FormInstance>();

const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {
    title: '',
    image_url: '',
    link_url: '',
    sort: 0,
    status: 1
  },
  api: undefined,
  getTableList: undefined
});

const rules = reactive({
  title: [{ required: true, message: '请输入轮播图标题' }],
  image_url: [{ required: true, message: '请上传轮播图' }],
  sort: [{ required: true, message: '请输入排序号' }],
  status: [{ required: true, message: '请选择状态' }]
});

// 接收父组件参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = { ...paramsProps.value, ...params };
  visible.value = true;
};

// 图片上传回调
const fileChange = (info: IUploadResult) => {
  if (info) {
    paramsProps.value.row.image_url = info.url;
  }
};

// 提交表单
const handleSubmit = () => {
  ruleFormRef.value?.validate(async valid => {
    if (!valid) return;
    await paramsProps.value.api!(paramsProps.value.row);
    visible.value = false;
    paramsProps.value.getTableList?.();
  });
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
:deep(.el-upload) {
  width: 100%;
}
</style> 