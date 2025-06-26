<template>
  <el-dialog
    v-model="visible"
    :title="`${paramsProps.title}`"
    :destroy-on-close="true"
    width="780px"
    draggable
  >
    <el-form
      ref="ruleFormRef"
      label-width="140px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
    >
      <el-form-item label="商品名称" prop="goods_name">
        <el-input
          v-model="paramsProps.row.goods_name"
          placeholder="请填写商品名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number
          v-model="paramsProps.row.price"
          placeholder="请填写价格"
          clearable
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="数量" prop="stock">
        <el-input-number
          v-model="paramsProps.row.stock"
          :precision="0"
          :min="1"
          :max="999999"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="paramsProps.row.status" clearable placeholder="请选择状态">
          <el-option
            v-for="item in optionsStore.getDictOptions('goods_status')"
            :key="item.code"
            :label="item.codeName"
            :value="item.code"
          />
        </el-select>
      </el-form-item>  <el-form-item label="封面图" prop="status">
         <UploadImg v-model:image-url="paramsProps.row.cover" @change="fileChange" dir="user" width="135px"
            height="135px" border-radius="50%">
            <template #empty>
              <el-icon>
                <Avatar />
              </el-icon>
              <span>请上传封面图</span>
            </template>
            <template #tip> 封面图大小不能超过 3M </template>
          </UploadImg>
      </el-form-item>

      <el-form-item label="详情" prop="content">
        <div style="border: 1px solid #ccc">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            :mode="mode"
          />
          <Editor
            style="height: 250px; overflow-y: hidden"
            v-model="paramsProps.row.content"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import UploadImg from '@/components/Upload/Img.vue';
import type { IUploadResult } from '@/api/interface/system/upload';
import { onBeforeUnmount, ref, shallowRef, onMounted, reactive } from 'vue';
import { type ElForm, ElMessage } from 'element-plus';
import { useOptionsStore } from '@/stores/modules/options';
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
defineOptions({
  name: 'TeacherStatisticsForm'
});
const mode = ref('default') // 编辑器模式
const optionsStore = useOptionsStore();
const editorRef = shallowRef()
const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }
// 内容 HTML
const rules = reactive({
  goods_name: [{ required: true, message: '请填写商品名称' }],
  price: [{ required: true, message: '请填写价格' }],
  stock: [{ required: true, message: '请填写库存量' }],
  content: [{ required: true, message: '请填写详情' }],
  status: [{ required: true, message: '请填写状态' }]
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
onMounted(() => {
  // setTimeout(() => {
  //   valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
  // }, 1500)
})

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

// 获取文件变更事件
const fileChange = (data: IUploadResult) => {
  console.log(data);
};



// 提交数据（新增/编辑）
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
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
