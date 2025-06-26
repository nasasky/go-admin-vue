<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable 
        ref="proTableRef" 
        title="菜单列表" 
        row-key="id" 
        :indent="20" 
        :columns="columns" 
        :request-api="getTableList"
        :pagination="false" 
        :default-expand-all="defaultExpandAllKey"
        :border="false"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <div class="header-button-group">
            <el-button type="primary" :icon="CirclePlus" @click="openAddEdit('新增菜单')">
              新增菜单
            </el-button>
            <el-button :icon="Sort" @click="changeExpand">
              {{ defaultExpandAllKey ? '折叠' : '展开' }}
            </el-button>
          </div>
        </template>

        <!-- 图标 -->
        <template #icon="scope">
          <div class="icon-preview">
            <el-icon :size="18" v-if="scope.row.meta.icon">
              <SvgIcon v-if="scope.row.meta.icon.startsWith('svg-')" :name="scope.row.meta.icon.substring(4)" />
              <component v-else :is="scope.row.meta.icon" />
            </el-icon>
          </div>
        </template>

        <!-- 类型 -->
        <template #menuTypeCd="{ row }">
          <el-tag :type="getMenuTypeTag(row.menuTypeCd)">
            {{ getMenuTypeName(row.menuTypeCd) }}
          </el-tag>
        </template>

        <!-- 状态开关 -->
        <template #useDataScope="scope">
          <el-switch 
            v-if="scope.row.menuTypeCd == '1002002'"
            v-model="scope.row.meta.useDataScope" 
            :active-value="'T'"
            :inactive-value="'F'" 
            :loading="switchLoading" 
            :before-change="() => changeDataScope(scope.row)"
          />
        </template>

        <!-- 菜单操作 -->
        <template #operation="{ row }">
          <div class="operation-group">
            <el-button 
              type="primary" 
              v-if="row.menuTypeCd !== MENU_BTN" 
              link 
              :icon="CirclePlus"
              @click="openAddEdit('新增子菜单', row)"
            >
              新增
            </el-button>
            <el-button 
              type="primary" 
              link 
              :icon="EditPen" 
              @click="openAddEdit('编辑菜单', row, false)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除此菜单及其子菜单吗？"
              @confirm="deleteInfo(row)"
            >
              <template #reference>
                <el-button 
                  type="danger" 
                  link 
                  :icon="Delete"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </ProTable>

      <!-- 菜单表单 -->
      <MenuForm ref="menuFormRef" />

      <!-- SQL预览弹框 -->
      <el-dialog 
        v-model="showSqlDialog" 
        :title="sqlDialTitle" 
        width="80%"
        destroy-on-close
      >
        <HighCode 
          :code="sqlData" 
          language="sql" 
          title="菜单SQL" 
          class="sql-box" 
        />
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, EditPen, CirclePlus, Sort } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import { addMenu, deleteMenu, editMenu, exportMenuSql, getMenuInfo, getMenuList, chaneDataRole } from '@/api/modules/system/menu';
import MenuForm from '@/views/system/menuMange/components/MenuForm.vue';
import { useHandleData } from '@/hooks/useHandleData';
import { MENU_BTN, MENU_DIR, MENU_PAGE } from '@/config/consts';
import { useOptionsStore } from '@/stores/modules/options';
import type { IMenu } from '@/api/interface/system/menu';
import type { ColumnProps, ProTableInstance } from '@/components/ProTable/interface';
import HighCode from '@/components/HighCode/index.vue';
import { computed, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { IS_PREVIEW } from '@/config';

defineOptions({
  name: 'MenuManage'
});

const showSqlDialog = ref(false);
const sqlData = ref<string>('');
const rowSqlName = ref<any>({});
const optionsStore = useOptionsStore();
const proTableRef = ref<ProTableInstance>();
const switchLoading = ref(false);
const defaultExpandAllKey = ref(true);

// 表格配置项
const columns: ColumnProps<Menu.MenuOptions>[] = [
  { prop: 'meta.title', label: '菜单名称', align: 'left'},
  { 
    prop: 'menuTypeCd', 
    label: '类型', 
    width: 100,
  },
  { prop: 'meta.icon', label: '图标', width: 80 },
  { prop: 'sort', label: '排序', width: 80 },
  { prop: 'name', label: '路由名称',  showOverflowTooltip: true },
  { prop: 'path', label: '路由地址',  showOverflowTooltip: true },
  { prop: 'key', label: '组件路径', showOverflowTooltip: true },
  { 
    prop: 'useDataScope', 
    label: '数据权限', 
    width: 100,
    align: 'center'
  },
  { 
    prop: 'operation', 
    label: '操作', 
    width: 200, 
    fixed: 'right',
    align: 'center'
  }
];

// 获取菜单类型标签样式
const getMenuTypeTag = (type: string) => {
  switch (type) {
    case MENU_DIR: return 'primary';
    case MENU_PAGE: return 'success';
    case MENU_BTN: return 'info';
    default: return '';
  }
};

// 获取菜单类型名称
const getMenuTypeName = (type: string) => {
  const menuType = optionsStore.getDictOptions('menu_type').find(item => item.id === type);
  return menuType?.codeName || '-';
};

// 获取table列表
const getTableList = (params: IMenu.Query) => getMenuList(params);

// 打开表单(新增、编辑)
const menuFormRef = ref<InstanceType<typeof MenuForm>>();
const openAddEdit = async (title: string, row: any = {}, isAdd = true) => {
  try {
    let formData = {};
    if (isAdd) {
      const pid = row.id || '0';
      const sort = await calculateSort(row, pid);
      formData = {
        pid,
        parent_id: pid,
        icon: '',
        sort,
        menuTypeCd: getNextMenuType(row.menuTypeCd),
        is_link: 'F',
        is_hidden: 'F',
        is_full: 'F',
        is_affix: 'F',
        isKeepAlive: 'F'
      };
    } else {
      const { data } = await getMenuInfo({ id: row.id });
      if (!data) {
        throw new Error('获取菜单详情失败');
      }
      formData = data;
    }

    const params = {
      title,
      row: { ...formData },
      api: isAdd ? addMenu : editMenu,
      getTableList: proTableRef.value?.getTableList
    };
    menuFormRef.value?.acceptParams(params);
  } catch (error) {
    console.error('打开表单失败:', error);
    ElMessage.error('打开表单失败，请重试');
  }
};

// 计算排序值
const calculateSort = async (row: any = {}, pid: string) => {
  const baseSort = 100;
  if (pid === '0') {
    return ((proTableRef.value?.tableData?.length || 0) + 1) * baseSort;
  }
  return ((row?.children?.length || 0) + 1) * baseSort;
};

// 获取下一级菜单类型
const getNextMenuType = (currentType?: string) => {
  switch (currentType) {
    case MENU_DIR: return MENU_PAGE;
    case MENU_PAGE: return MENU_BTN;
    default: return MENU_DIR;
  }
};

// 删除菜单
const deleteInfo = async (params: Menu.MenuOptions) => {
  if (IS_PREVIEW) {
    ElMessage.warning('预览环境，禁止删除菜单，请谅解！');
    return;
  }
  try {
    await useHandleData(deleteMenu, { ids: [params.id] }, `删除【${params?.meta?.title}】菜单及其子菜单`);
    proTableRef.value?.getTableList();
  } catch (error) {
    console.error('删除菜单失败:', error);
  }
};

// 展示SQL信息
const showSqlInfo = async (row: any = {}) => {
  try {
    rowSqlName.value = row;
    const { data } = await exportMenuSql({ ids: [row.id] });
    sqlData.value = data;
    showSqlDialog.value = true;
  } catch (error) {
    console.error('获取SQL失败:', error);
    ElMessage.error('获取SQL失败，请重试');
  }
};

// SQL弹框标题
const sqlDialTitle = computed(() => {
  return `SQL [${rowSqlName.value?.meta?.title || ''}]`;
});

// 展开/折叠
const changeExpand = () => {
  defaultExpandAllKey.value = !defaultExpandAllKey.value;
  proTableRef.value?.refresh();
};

// 切换数据权限
const changeDataScope = async (params: Menu.MenuOptions) => {
  if (switchLoading.value) return false;
  
  if (IS_PREVIEW && params.id === '85b54322630f43a39296488a5e76ba16') {
    ElMessage.warning('预览环境，禁止修改，请谅解！');
    return false;
  }

  try {
    switchLoading.value = true;
    
    if (params.meta.useDataScope === 'T') {
      await ElMessageBox.confirm(
        `确认要关闭菜单 [${params.meta.title}] 的数据权限支持吗？此操作可能导致数据权限失效！`,
        '温馨提示',
        { type: 'warning' }
      );
    }
    
    await chaneDataRole({ id: params.id });
    ElMessage.success('切换数据权限成功');
    return true;
  } catch (error) {
    console.error('切换数据权限失败:', error);
    return false;
  } finally {
    switchLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.main-box {
  .header-button-group {
    display: flex;
    gap: 12px;
  }

  .icon-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    
    :deep(.el-icon) {
      color: var(--el-text-color-regular);
    }
  }

  .operation-group {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  :deep(.el-tag) {
    min-width: 60px;
    text-align: center;
  }
}

.sql-box {
  margin: 0 auto;
  width: 90%;
  max-height: 60vh;
  overflow: auto;
  border-radius: 4px;
  
  :deep(pre) {
    margin: 0;
    padding: 16px;
  }
}
</style>
