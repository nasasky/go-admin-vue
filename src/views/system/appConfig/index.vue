<!-- 系统配置 -->
<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="系统配置"
      :indent="20"
      :columns="columns"
      :request-api="getTableList"
      row-key="id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDialog('add')">新增配置</el-button>
      </template>

      <!-- 表格操作 -->
      <template #operation="{ row }">
        <el-button type="primary" link :icon="EditPen" @click="openDialog('edit', row)">编辑</el-button>
      </template>
    </ProTable>

    <!-- 新增/编辑系统配置 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogProps.title"
      width="600px"
      :destroy-on-close="true"
    >
      <el-form
        ref="ruleFormRef"
        :model="dialogProps.row"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="系统名称" prop="system_name">
          <el-input v-model="dialogProps.row.system_name" placeholder="请输入系统名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="系统标题" prop="system_title">
          <el-input v-model="dialogProps.row.system_title" placeholder="请输入系统标题" clearable></el-input>
        </el-form-item>
        <el-form-item label="备案号" prop="icp_number">
          <el-input v-model="dialogProps.row.icp_number" placeholder="请输入备案号" clearable></el-input>
        </el-form-item>
        <el-form-item label="版权信息" prop="copyright">
          <el-input v-model="dialogProps.row.copyright" placeholder="请输入版权信息" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="dialogProps.row.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="appConfig">
import { ref, reactive } from "vue"
import { CirclePlus, EditPen } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import type { FormInstance } from "element-plus"
import type { ProTableInstance, ColumnProps } from "@/components/ProTable/interface"
import ProTable from "@/components/ProTable/index.vue"
import { addSystemInfo, updateSystemInfo, getSystemInfoList } from "@/api/modules/system/config"
import type { SystemInfo, SystemInfoReq } from "@/api/interface/system/config"

// 表格配置
const columns: ColumnProps[] = [
  { type: "index", label: "#", width: 80 },
  { prop: "system_name", label: "系统名称", width: 180 },
  { prop: "system_title", label: "系统标题", width: 180 },
  { prop: "icp_number", label: "备案号", width: 180 },
  { prop: "copyright", label: "版权信息" },
  {
    prop: "status",
    label: "状态",
    width: 180,
    tag: true,
    enum: [
      { label: "禁用", value: 0, tagType: "danger" },
      { label: "启用", value: 1, tagType: "success" }
    ]
  },
  { prop: "operation", label: "操作", width: 180, fixed: "right" }
]

// 表格数据
const proTableRef = ref<ProTableInstance>()

// 获取table列表
const getTableList = (params: any) => {
  return getSystemInfoList()
}

// 弹框表单
const ruleFormRef = ref<FormInstance>()
const dialogVisible = ref(false)
const dialogProps = reactive({
  title: "新增系统配置",
  row: {} as SystemInfo,
  api: addSystemInfo as (params: SystemInfoReq) => Promise<any>
})

// 表单校验规则
const rules = reactive({
  system_name: [{ required: true, message: "请输入系统名称", trigger: "blur" }],
  system_title: [{ required: true, message: "请输入系统标题", trigger: "blur" }]
})

// 打开弹框
const openDialog = async (type: string, row?: SystemInfo) => {
  dialogVisible.value = true
  if (type === "edit") {
    dialogProps.title = "编辑系统配置"
    dialogProps.row = { 
      ...row!,
      id: row!.id // 确保 id 被传递
    }
    dialogProps.api = updateSystemInfo as (params: SystemInfoReq) => Promise<any>
  } else {
    dialogProps.title = "新增系统配置"
    dialogProps.row = { status: 0 } as SystemInfo
    dialogProps.api = addSystemInfo as (params: SystemInfoReq) => Promise<any>
  }
}

// 提交表单
const handleSubmit = async () => {
  await ruleFormRef.value?.validate()
  const params = {
    ...dialogProps.row,
    id: dialogProps.row.id // 确保编辑时传递 id
  }
  await dialogProps.api(params)
  ElMessage.success(`${dialogProps.title}成功！`)
  dialogVisible.value = false
  proTableRef.value?.getTableList()
}
</script>