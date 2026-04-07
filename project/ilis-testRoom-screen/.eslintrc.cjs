module.exports = {
  env: {
    "node": true,
    "commonjs": true
  },
  // 当前配置为根配置，将不再从上级文件夹查找配置
  root: true,
  /* 指定如何解析语法。可以为空，但若不为空，只能配该值，原因见下文。*/
  parser: "vue-eslint-parser",
  /* 优先级低于parse的语法解析配置 */
  parserOptions: {
    parser: "@typescript-eslint/parser"
  },
  extends: [
    // 扩展使用 vue3 检查规则和eslint推荐规则
    "plugin:vue/vue3-recommended",
    //"eslint:recommended",
    // typescript-eslint推荐规则
    "plugin:@typescript-eslint/recommended",
    // prettier推荐规则,
    "prettier",
    "plugin:prettier/recommended"
  ],
  plugins: ["prettier"],
  rules: {
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off", // 禁用 debugger
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off", // 禁用 console
    // 关闭名称校验
    "vue/multi-word-component-names": "off",
    // 禁止使用 var
    "no-var": "error",
    // 允许修改使用const（no-const-assign）声明的变量
    'prefer-const': 'off',
    // 优先使用 interface 而不是 type
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    // 禁止any类型,报错关闭
    "@typescript-eslint/no-explicit-any": "off",
    // 需要导出函数和类的公共类方法的显式返回和参数类型,报错关闭
    "@typescript-eslint/explicit-module-boundary-types": "off",
    // 禁止某些类型如String、Number,报错关闭
    "@typescript-eslint/ban-types": "off",
    // 禁止未使用的变量,报错关闭
    "@typescript-eslint/no-unused-vars": "warn",
    // vue首行缩进两字符
    "vue/html-indent": [
      "off",
      2,
      {
        // 属性缩进的乘数。默认为1。
        attribute: 1,
        // 顶级语句的缩进倍数。默认为1。
        baseIndent: 1,
        // 右括号缩进的乘数。默认为0。
        closeBracket: 0,
        // 属性是否应垂直对齐到多行情况下的第一个属性的条件。默认为true
        alignAttributesVertically: true,
        // 忽略节点的选择器。默认是[]
        ignores: [],
      },
    ],
    // 每行最大属性数关闭
    "vue/max-attributes-per-line": ["off"],
    // 要求单行元素的内容前后有一个换行符
    "vue/singleline-html-element-content-newline": "off", 
    // 编辑器里会给prettier错误进行报错
    "prettier/prettier": "error"
  }
}
