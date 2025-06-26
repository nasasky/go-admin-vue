<template>
  <el-dialog
    v-model="visible"
    :title="`${paramsProps.title}`"
    :destroy-on-close="true"
    width="780px"
    draggable
    class="product-form-dialog"
  >
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
      class="product-form"
    >
      <div class="form-main">
        <div class="form-left">
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
              :precision="2"
              :min="0"
              :max="999999"
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
            <el-select v-model="paramsProps.row.status" clearable placeholder="请选择状态" style="width: 100%">
              <el-option
                v-for="item in optionsStore.getDictOptions('goods_status')"
                :key="item.code"
                :label="item.codeName"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-right">
          <el-form-item label="封面图" prop="cover" class="upload-item">
            <UploadImg 
              v-model:image-url="paramsProps.row.cover" 
              @change="fileChange" 
              dir="goods" 
              width="200px"
              height="200px" 
              :border-radius="8"
            >
              <template #empty>
                <div class="upload-empty">
                  <el-icon class="upload-icon"><Picture /></el-icon>
                  <span>请上传封面图</span>
                </div>
              </template>
              <template #tip>
                <div class="upload-tip">建议尺寸 800x800px，大小不超过 3M</div>
              </template>
            </UploadImg>
          </el-form-item>
        </div>
      </div>

      <el-form-item label="详情" prop="content" class="editor-item">
        <div class="editor-wrapper">
          <Toolbar
            style="border-bottom: 1px solid #dcdfe6"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            :mode="mode"
          />
          <Editor
            style="height: 300px"
            v-model="paramsProps.row.content"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
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
import { Picture } from '@element-plus/icons-vue'

defineOptions({
  name: 'ProductForm'
});

const mode = ref('default') // 编辑器模式
const optionsStore = useOptionsStore();
const editorRef = shallowRef()

const toolbarConfig = {
  excludeKeys: [
    'uploadVideo',
    'insertTable',
    'group-video',
    'group-image'
  ]
}

const editorConfig = { 
  placeholder: '请输入商品详情...',
  MENU_CONF: {
    uploadImage: {
      server: '/admin/file/upload',
      fieldName: 'file',
      maxFileSize: 10 * 1024 * 1024,
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      meta: {
        dir: 'goods'
      },
      customInsert(res: any, insertFn: any) {
        insertFn(res.data.url)
      }
    }
  }
}

const rules = reactive({
  goods_name: [{ required: true, message: '请填写商品名称' }],
  price: [{ required: true, message: '请填写价格' }],
  stock: [{ required: true, message: '请填写库存量' }],
  content: [{ required: true, message: '请填写详情' }],
  status: [{ required: true, message: '请选择状态' }],
  cover: [{ required: true, message: '请上传封面图' }]
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
  // 初始化编辑器配置
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

<style scoped lang="scss">
.product-form-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}

.product-form {
  .form-main {
    display: flex;
    gap: 40px;
    margin-bottom: 20px;

    .form-left {
      flex: 1;
    }

    .form-right {
      width: 300px;
    }
  }

  .upload-item {
    :deep(.el-form-item__content) {
      justify-content: center;
    }
  }

  .upload-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #909399;
    
    .upload-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    text-align: center;
    margin-top: 8px;
  }

  .editor-item {
    margin-bottom: 0;
  }

  .editor-wrapper {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}
</style>
