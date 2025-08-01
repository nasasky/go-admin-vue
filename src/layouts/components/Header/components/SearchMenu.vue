<template>
  <div class="menu-search-dialog">
    <i :class="'iconfont icon-sousuo'" class="toolBar-icon" @click="handleOpen" />
    <el-dialog v-model="isShowSearch" destroy-on-close :modal="false" :show-close="false" fullscreen @click="closeSearch">
      <el-autocomplete
        ref="menuInputRef"
        v-model="searchMenu"
        value-key="path"
        placeholder="菜单搜索 ：支持菜单名称、路径"
        :fetch-suggestions="searchMenuList"
        @select="handleClickMenu"
        @click.stop
      >
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
        <template #default="{ item }">
          <el-icon>
            <component :is="item.meta.icon" />
          </el-icon>
          <span> {{ item.meta.title }} </span>
        </template>
      </el-autocomplete>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/modules/auth';

const router = useRouter();
const authStore = useAuthStore();
const menuList = computed(() => authStore.flatMenuListGet.filter(item => item.meta));

const searchMenuList = (queryString: string, cb: Function) => {
  const results = queryString ? menuList.value.filter(filterNodeMethod(queryString)) : menuList.value;
  cb(results);
};

// 打开搜索框
const isShowSearch = ref(false);
const menuInputRef = ref();
const searchMenu = ref('');
const handleOpen = () => {
  isShowSearch.value = true;
  nextTick(() => {
    setTimeout(() => {
      menuInputRef.value.focus();
    });
  });
};

// 搜索窗关闭
const closeSearch = () => {
  isShowSearch.value = false;
};

// 筛选菜单
const filterNodeMethod = (queryString: string) => {
  return (restaurant: Menu.MenuOptions) => {
    return (
      restaurant.path.toLowerCase().indexOf(queryString.toLowerCase()) > -1 ||
      restaurant.meta.title.toLowerCase().indexOf(queryString.toLowerCase()) > -1
    );
  };
};

// 点击菜单跳转
const handleClickMenu = (menuItem: Record<string, any>): void => {
  searchMenu.value = '';
  if (menuItem.meta.isLink) window.open(menuItem.meta.isLink, '_blank');
  else router.push(menuItem.path);
  closeSearch();
};
</script>

<style scoped lang="scss">
.menu-search-dialog {
  :deep(.el-dialog) {
    background-color: rgb(0 0 0 / 50%);
    border-radius: 0 !important;
    box-shadow: unset !important;

    .el-dialog__header {
      border-bottom: none !important;
    }
  }

  :deep(.el-autocomplete) {
    position: absolute;
    top: 100px;
    left: 50%;
    width: 550px;
    transform: translateX(-50%);

    .el-input__wrapper {
      background-color: var(--el-bg-color);
    }
  }
}

.el-autocomplete__popper {
  .el-icon {
    position: relative;
    top: 2px;
    font-size: 16px;
  }

  span {
    margin: 0 0 0 10px;
    font-size: 14px;
  }
}
</style>
