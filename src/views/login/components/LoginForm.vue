<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" placeholder="用户名">
        <template #prefix>
          <el-icon class="el-input__icon">
            <user />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="密码"
        show-password
        autocomplete="new-password"
      >
        <template #prefix>
          <el-icon class="el-input__icon">
            <lock />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="captcha" class="captcha-item">
      <div class="captcha-wrapper">
        <el-input
          v-model="loginForm.captcha"
          placeholder="请输入验证码"
          style="width: 200px"
        >
          <template #prefix>
            <el-icon class="el-input__icon">
              <key />
            </el-icon>
          </template>
        </el-input>
        <div 
          class="captcha-img" 
          @click="refreshCaptcha"
          v-html="captchaSvg"
        ></div>
      </div>
    </el-form-item>
    <el-form-item>
      <el-checkbox v-model="rememberMe">记住账号密码</el-checkbox>
    </el-form-item>
  </el-form>
  <div class="login-btn">
    <el-button :icon="CircleClose" round size="large" @click="resetForm">重置</el-button>
    <el-button :icon="UserFilled" round size="large" type="primary" :loading="loading" @click="login">登录</el-button>
  </div>
  <div v-if="IS_PREVIEW" style="margin-top: 20px; color: var(--el-color-warning)">
    <span>如无法登陆请联系作者：feiyuchuixue@163.com</span>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { HOME_URL, IS_PREVIEW } from '@/config';
import { getTimeState } from '@/utils';
import { loginApi } from '@/api/modules/system/login';
import { useUserStore } from '@/stores/modules/user';
import { useTabsStore } from '@/stores/modules/tabs';
import { useKeepAliveStore } from '@/stores/modules/keepAlive';
import { CircleClose, Lock, User, UserFilled, Key, Refresh } from '@element-plus/icons-vue';
import { initDynamicRouter } from '@/router/modules/dynamicRouter';
import { useWebsocketStore } from '@/stores/modules/websocket';
import { onMounted, reactive, ref } from 'vue';
import { ElNotification, ElMessage } from 'element-plus';
import { getImageCaptcha } from '@/api/modules/system/captcha';

const router = useRouter();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();
const websocketStore = useWebsocketStore();

const loginFormRef = ref();
const loading = ref(false);
const captchaSvg = ref('');
const rememberMe = ref(true);

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  clientId: '',
  grantType: ''
});

const loginRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
});

// 获取验证码
const getCaptcha = async () => {
  try {
    const data = await getImageCaptcha();
    console.log('SVG Content:', data); // 调试用
    captchaSvg.value = data as any;
    // 确保SVG被正确设置
    console.log('captchaSvg value:', captchaSvg.value);
    // 延迟检查DOM
    setTimeout(() => {
      const captchaEl = document.querySelector('.captcha-img');
      console.log('Captcha element HTML:', captchaEl?.innerHTML);
    }, 100);
  } catch (error) {
    console.error('获取验证码失败:', error);
    ElMessage.error('获取验证码失败，请刷新重试');
  }
};

// 刷新验证码
const refreshCaptcha = () => {
  loginForm.captcha = '';
  getCaptcha();
};

// 从localStorage加载保存的账号密码
const loadSavedCredentials = () => {
  const savedCredentials = localStorage.getItem('loginCredentials');
  if (savedCredentials) {
    const { username, password } = JSON.parse(savedCredentials);
    loginForm.username = username;
    loginForm.password = password;
    rememberMe.value = true;
  }
};

// 保存或清除账号密码
const handleCredentials = () => {
  if (rememberMe.value) {
    localStorage.setItem('loginCredentials', JSON.stringify({
      username: loginForm.username,
      password: loginForm.password
    }));
  } else {
    localStorage.removeItem('loginCredentials');
  }
};

// 修改执行登录函数
const performLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
    loading.value = true;

    // 保存或清除账号密码
    handleCredentials();

    // 直接执行登录，验证码随登录请求一起发送
    const { data } = await loginApi({ 
      ...loginForm
    });
    
    userStore.setToken(data.token);
    userStore.setUserInfo(data.user);

    await initDynamicRouter();
    tabsStore.closeMultipleTab();
    keepAliveStore.setKeepAliveName();

    router.push(HOME_URL);
    ElNotification({
      title: getTimeState(),
      message: '欢迎登录 Admin',
      type: 'success',
      duration: 3000
    });
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请重试');
    refreshCaptcha(); // 登录失败时刷新验证码
  } finally {
    loading.value = false;
  }
};

// 修改重置表单函数
const resetForm = () => {
  if (!loginFormRef.value) return;
  loginFormRef.value.resetFields();
  refreshCaptcha();
  // 清除保存的账号密码
  localStorage.removeItem('loginCredentials');
  rememberMe.value = false;
};

// 登录按钮点击
const login = () => {
  performLogin();
};

// 监听回车事件和初始化
onMounted(() => {
  getCaptcha(); // 初始获取验证码
  loadSavedCredentials(); // 加载保存的账号密码
  
  document.onkeydown = (e: KeyboardEvent) => {
    e = (window.event as KeyboardEvent) || e;
    if (e.code === 'Enter' || e.code === 'enter' || e.code === 'NumpadEnter') {
      if (loading.value) return;
      login();
    }
  };
});
</script>

<style scoped lang="scss">
@import '../index.scss';

.captcha-item {
  .captcha-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;

    .captcha-img {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      overflow: hidden;
      background: #fff;
      width: 220px !important;
      height: 40px !important;

      &:hover {
        opacity: 0.8;
      }

      :deep(svg) {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
    }
  }
}
</style>
