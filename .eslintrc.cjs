// @see: http://eslint.cn

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  // 指定如何解析语法
  parser: "vue-eslint-parser",
  // 优先级低于 parse 的语法解析配置
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    sourceType: "module",
    jsxPragma: "React",
    ecmaFeatures: {
      jsx: true
    }
  },
  // 继承某些已有的规则
  extends: ["plugin:vue/vue3-recommended", "plugin:@typescript-eslint/recommended"],
  /**
   * "off" 或 0    ==>  关闭规则
   * "warn" 或 1   ==>  打开的规则作为警告（不影响代码执行）
   * "error" 或 2  ==>  规则作为一个错误（代码不能执行，界面报错）
   */
  rules: {
    // eslint (http://eslint.cn/docs/rules)
    "no-var": "error", // 要求使用 let 或 const 而不是 var
    "no-multiple-empty-lines": ["error", { max: 1 }], // 不允许多个空行
    "prefer-const": "off", // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
    "no-use-before-define": "off", // 禁止在 函数/类/变量 定义之前使用它们
    
    // vue (https://eslint.vuejs.org/rules)
    "vue/html-closing-bracket-newline": "off", // 禁用括号换行规则
    "vue/html-indent": "off", // 禁用缩进规则
    "vue/max-attributes-per-line": "off", // 禁用每行最大属性数限制
    "vue/singleline-html-element-content-newline": "off", // 关闭单行元素内容要求换行
    "vue/html-self-closing": "off", // 关闭自闭合标签检查
    "vue/v-slot-style": "error", // 强制执行 v-slot 指令样式
    "vue/no-mutating-props": "error", // 不允许改变组件 prop
    "vue/custom-event-name-casing": "error", // 为自定义事件名称强制使用特定大小写
    "vue/attribute-hyphenation": "off", // 禁用属性连字符规则
    "vue/attributes-order": "off", // vue api使用顺序，强制执行属性顺序
    "vue/no-v-html": "off", // 禁止使用 v-html
    "vue/require-default-prop": "off", // 此规则要求为每个 prop 为必填时，必须提供默认值
    "vue/multi-word-component-names": "off", // 要求组件名称始终为 "-" 链接的单词
    "vue/no-setup-props-destructure": "off", // 禁止解构 props 传递给 setup
    "vue/first-attribute-linebreak": "off", // 新增：第一个属性的换行规则
    "vue/html-closing-bracket-spacing": "off", // 新增：闭合括号的空格规则
    "vue/multiline-html-element-content-newline": "off", // 新增：多行内容换行规则
    
    // typescript
    "@typescript-eslint/no-explicit-any": "off", // 允许使用 any 类型
    "@typescript-eslint/ban-types": "off", // 允许使用特定类型如 Function
    "@typescript-eslint/no-empty-function": "off", // 允许空函数
    "@typescript-eslint/no-non-null-assertion": "off" // 允许使用非空断言
  }
};
