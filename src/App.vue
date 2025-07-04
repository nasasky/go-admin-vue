<template>
  <el-config-provider :locale="locale" :size="assemblySize" :button="buttonConfig">
    <RouterView />
  </el-config-provider>
</template>

<script setup lang="ts">

import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/modules/app';
import { useI18n } from 'vue-i18n';
import { getBrowserLang } from '@/utils';
import en from 'element-plus/es/locale/lang/en';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import type { LanguageType } from '@/stores/interface/app';
import { computed, onMounted, reactive, onBeforeUnmount, watch } from 'vue';
import { useWebsocketStore } from '@/stores/modules/websocket';
import { useUserStore } from '@/stores/modules/user';
import { useRoute } from 'vue-router';

const appStore = useAppStore();
// init theme
const { initTheme } = useTheme();

initTheme();

// init language
const i18n = useI18n();

// element language
const locale = computed(() => {
  if (appStore.language === 'zh') return zhCn;
  if (appStore.language === 'en') return en;
  return getBrowserLang() === 'zh' ? zhCn : en;
});

// element assemblySize
const assemblySize = computed(() => appStore.assemblySize);

// element button config
const buttonConfig = reactive({ autoInsertSpace: false });

const websocketStore = useWebsocketStore();
const userStore = useUserStore();
const route = useRoute();

// 监听路由变化，确保在需要时重新连接WebSocket
watch(() => userStore.token, (newToken, oldToken) => {
  if (newToken && newToken !== oldToken) {
    // 只在token变化时初始化
    websocketStore.initWebSocket();
  } else if (!newToken) {
    websocketStore.disconnect();
  }
}, { immediate: true });

// 在组件卸载前断开WebSocket连接
onBeforeUnmount(() => {
  websocketStore.disconnect();
});
</script>
