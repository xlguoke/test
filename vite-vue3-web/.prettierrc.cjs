// prettier的默认配置文件
module.exports = {
  // 一行最多 100 字符
  printWidth: 100,
  // 指定 HTML 文件的全局空白区域敏感度, "ignore" - 空格被认为是不敏感的
  htmlWhitespaceSensitivity: "ignore",
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 不使用缩进符，而使用空格
  useTabs: false,
  // 不尾随分号
  semi: false,
  // 使用单引号
  singleQuote: false,
  // 多行逗号分割的语法中，最后一行不加逗号
  trailingComma: "none",
  // 单个参数的箭头函数不加括号 x => x
  arrowParens: "always",
  // 对象大括号内两边是否加空格 { a:0 }
  bracketSpacing: true,
  // 换行符使用 auto
  endOfLine: "auto",
  eslintIntegration: false //不让prettier使用eslint的代码格式进行校验
}
