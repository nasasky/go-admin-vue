<template>
  <div class="login-container flx-center">
    <div class="login-box">
      <SwitchDark class="dark" />
      <div class="login-left">
        <img class="login-left-img" src="@/assets/images/login_left3.png" alt="login" />
      </div>
      <div class="login-form">
        <div class="login-logo">
          <img class="login-icon" src="@/assets/images/logo.svg" alt="" />
          <h2 class="logo-text">{{ systemInfo.system_name || 'Blog' }}</h2>
        </div>
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SwitchDark from '@/components/SwitchDark/index.vue';
import LoginForm from '@/views/login/components/LoginForm.vue';
import { getSystemInfoFirst } from '@/api/modules/system/config';
import type { SystemInfo } from '@/api/interface/system/config';

// 系统配置信息
const systemInfo = ref<SystemInfo>({
  system_name: 'Blog',
  system_title: '',
  status: 1
});

// 获取系统配置信息
const fetchSystemInfo = async () => {
  try {
    const response = await getSystemInfoFirst();
    systemInfo.value = response.data;
  } catch (error) {
    console.error('获取系统配置失败:', error);
  }
};

onMounted(() => {
  fetchSystemInfo();
});
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
