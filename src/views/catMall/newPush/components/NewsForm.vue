<template>
  <el-dialog
    v-model="visible"
    :title="`${paramsProps.title}`"
    :destroy-on-close="true"
    width="780px"
    draggable
    class="news-form-dialog"
  >
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
      class="news-form"
    >
      <div class="form-main">
        <div class="form-left">
          <el-form-item label="标题" prop="title">
            <el-input
              v-model="paramsProps.row.title"
              placeholder="请填写标题"
              clearable
            />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="paramsProps.row.description"
              placeholder="请填写描述"
              clearable
            />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="paramsProps.row.sort"
              :precision="0"
              :min="0"
              :max="999999"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="paramsProps.row.status" clearable placeholder="请选择状态" style="width: 100%">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-right">
          <el-form-item label="封面图" prop="cover_image" class="upload-item">
            <UploadImg 
              v-model:image-url="paramsProps.row.cover_image" 
              @change="fileChange" 
              dir="news" 
              width="200px"
              height="200px" 
              :border-radius="'8'"
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

      <el-form-item label="内容" prop="content" class="editor-item">
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
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { Picture } from '@element-plus/icons-vue'
import { addNews, updateNews, getNewsDetail } from '@/api/modules/news';
import type { AddNewsReq } from '@/api/interface/news/news';

defineOptions({
  name: 'NewsForm'
});

const mode = ref('default') // 编辑器模式
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
  placeholder: '请输入资讯内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/admin/file/upload',
      fieldName: 'file',
      maxFileSize: 10 * 1024 * 1024,
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      meta: {
        dir: 'news'
      },
      customInsert(res: any, insertFn: any) {
        insertFn(res.data.url)
      }
    }
  }
}

const rules = reactive({
  title: [{ required: true, message: '请填写标题' }],
  content: [{ required: true, message: '请填写内容' }],
  status: [{ required: true, message: '请选择状态' }],
  cover_image: [{ required: true, message: '请上传封面图' }]
});

const visible = ref(false);
const paramsProps = ref<{ title: string; row: Partial<AddNewsReq & { id?: number }>; api: any; getTableList: any }>({ 
  title: '', 
  row: {
    title: '',
    description: '',
    content: '',
    cover_image: '',
    sort: 0,
    status: 1
  }, 
  api: null, 
  getTableList: null 
});

// 接收父组件传过来的参数
const acceptParams = async (params: any) => {
  let rowData;
  
  // 如果是编辑模式且有ID，先获取详情
  if (params.row && params.row.id) {
    try {
      const response = await getNewsDetail(params.row.id);
      rowData = response.data || params.row;
    } catch (error) {
      console.error('获取详情失败:', error);
      rowData = params.row;
    }
  } else {
    // 新增模式，使用默认值
    rowData = {
      title: '',
      description: '',
      content: '',
      cover_image: '',
      sort: 0,
      status: 1
    };
  }
  
  // 深拷贝数据，避免直接修改原对象
  const finalRowData = JSON.parse(JSON.stringify(rowData));
  
  paramsProps.value = {
    ...params,
    row: finalRowData
  };
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

const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

// 获取文件变更事件
const fileChange = (data: IUploadResult) => {
  console.log(data);
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const handleSubmit = () => {
  ruleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      if (paramsProps.value.row.id) {
        await updateNews(paramsProps.value.row.id, paramsProps.value.row as AddNewsReq);
        ElMessage.success('编辑成功');
      } else {
        await addNews(paramsProps.value.row as AddNewsReq);
        ElMessage.success('新增成功');
      }
      visible.value = false;
      paramsProps.value.getTableList && paramsProps.value.getTableList();
    } catch (e) {
      ElMessage.error('操作失败');
    }
  });
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.news-form-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}

.news-form {
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