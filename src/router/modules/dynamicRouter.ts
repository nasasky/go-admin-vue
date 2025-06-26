import { useUserStore } from '@/stores/modules/user';
import { useAuthStore } from '@/stores/modules/auth';
import { useOptionsStore } from '@/stores/modules/options';
import { LOGIN_URL } from '@/config';
import router from '@/router';
import type { RouteRecordRaw } from 'vue-router';
import { ro } from 'element-plus/es/locale/index.mjs';

// 引入 views 文件夹下所有 vue 文件
const modules = import.meta.glob('@/views/**/*.vue');

/**
 * @description 初始化动态路由
 */
export const initDynamicRouter = async () => {
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const optionsStore = useOptionsStore();

  try {
    if (authStore.isLoaded) return;
    // 1.获取菜单列表 && 按钮权限列表 && 字典列表
    await authStore.getAuthMenuList();
    // await authStore.getAuthButtonList();
    // await authStore.getAuthRoleList();
    optionsStore.setReloadOptions();
     await optionsStore.getAllDictList();
    await authStore.setLoaded();

    // 2.判断当前用户有没有菜单权限
    // if (!authStore.authMenuListGet.length) {
    //   ElNotification({
    //     title: '无权限访问',
    //     message: '当前账号无任何菜单权限，请联系系统管理员！',
    //     type: 'warning',
    //     duration: 3000
    //   })
    //   userStore.setToken('')
    //   router.replace(LOGIN_URL)
    //   return Promise.reject('No permission')
    // }

    // 3.添加动态路由
    // ...existing code...

    // 3.添加动态路由
    console.log('开始添加动态路由');
    authStore.flatMenuListGet.forEach(item => {
      try {
        // 克隆对象，避免修改原始数据
        const route = { ...item };

        // 移除children属性
        route.children && delete route.children;

        // 处理组件
        if (route.key && typeof route.key === 'string') {
          route.path = route.rule;
          route.name = route.rule;
         
          route.meta = {
            title: route.title,
            isAffix: 'F',
            isFull: 'F',
            isHidden: 'F',
            isKeepAlive: 'T',
            icon: route.meta.icon,
            useDataScope: 'F',
          };
          const componentPath = '/src/views' + route.key + '.vue';
          console.log('组件路径:', componentPath, '存在:', !!modules[componentPath]);

          if (modules[componentPath]) {
            route.component = modules[componentPath]; // 正确设置component
          } else {
            console.warn(`组件不存在: ${componentPath}`);
            return; // 跳过此路由
          }
        }

        // 确保路由对象符合要求
        if (!route.path) {
          // 如果没有path属性，也增加路由
          console.warn('路由缺少path属性:', route);
          return;
        }

        console.log('添加路由:', JSON.stringify({
          path: route.path,
          name: route.name,
          meta: route.meta
        }));

        // 添加路由
        if (route.meta?.isFull === 'T') {
          router.addRoute(route as unknown as RouteRecordRaw);
        } else {
          if (router.hasRoute('layout')) {
            router.addRoute('layout', route as unknown as RouteRecordRaw);
          } else {
            router.addRoute(route as unknown as RouteRecordRaw);
          }
        }

        // 验证路由是否添加成功
        console.log(`路由 ${route.path} 添加成功:`, router.hasRoute(route.name));

      } catch (error) {
        console.error('添加路由出错:', error);
      }
    });

    // ...existing code...
  } catch (error) {
    // 当按钮 || 菜单请求出错时，重定向到登陆页
    userStore.setToken('');
    router.replace(LOGIN_URL);
    return Promise.reject(error);
  }
};
