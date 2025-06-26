// 在src/types目录下创建wangeditor.d.ts文件
declare module '@wangeditor/editor-for-vue' {
    import { Component } from 'vue'
    
    export const Editor: Component
    export const Toolbar: Component
    // 根据需要添加其他导出
  }