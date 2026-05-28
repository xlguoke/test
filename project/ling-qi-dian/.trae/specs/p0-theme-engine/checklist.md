# Checklist: H5 主题配置引擎与工程骨架

> 验收标准：每个检查项必须通过视觉检查、代码审查、运行验证三重确认

---

## 0.1 工程骨架

- [ ] pnpm-workspace.yaml 正确定义 packages: ['packages/*']
- [ ] 根目录 package.json 包含 dev:h5 / dev:admin / build:h5 / build:admin / lint 脚本
- [ ] tsconfig.base.json 配置 @shared/* 和 @/* 路径别名
- [ ] packages/shared/package.json name 为 @lingqi/shared，type: module
- [ ] packages/app/package.json name 为 @lingqi/app，依赖 @lingqi/shared
- [ ] packages/admin/package.json name 为 @lingqi/admin，依赖 @lingqi/shared
- [ ] pnpm install 无依赖冲突，安装成功
- [ ] pnpm dev:h5 启动成功，浏览器可访问 localhost 页面
- [ ] @lingqi/shared 可被 @lingqi/app 正确 import

## 0.2 CSS Variables 主题系统

- [ ] theme.css 中 :root 定义了全部颜色 token（17 个）
- [ ] theme.css 中 :root 定义了全部字号 token（9 个 + 3 个字重）
- [ ] theme.css 中 :root 定义了全部间距 token（7 个）
- [ ] theme.css 中 :root 定义了全部圆角 token（6 个）
- [ ] theme.css 中 :root 定义了全部阴影 token（3 个）
- [ ] utilities.css 定义了至少 20 个工具类
- [ ] 工具类全部使用 var() 引用 CSS 变量，无硬编码值
- [ ] 浏览器 Elements 面板检查：工具类计算值为 CSS Variable，非硬编码色值

## 0.3 SCSS 变量映射

- [ ] variables.scss 定义了全部 token 的 SCSS 变量映射
- [ ] mixins.scss 定义了 flex-center、text-ellipsis、safe-area-bottom、card-style 等 mixins
- [ ] vite.config.ts 配置了 additionalData 自动注入 variables.scss 和 mixins.scss
- [ ] 组件中使用 `$color-primary` 编译后输出 `var(--color-primary)`

## 0.4 Vant UI 主题覆盖

- [ ] vant-theme.css 覆盖了至少 30 个 Vant CSS Variables
- [ ] --van-primary-color 映射到 var(--color-primary)
- [ ] --van-button-primary-background 映射到 var(--color-primary)
- [ ] --van-button-border-radius 映射到 var(--radius-full)
- [ ] --van-tab-active-text-color 映射到 var(--color-primary)
- [ ] 测试页面展示 Button、Tab、Cell、Tag 组件
- [ ] Vant Button primary 类型显示为青绿色 #4ECDC4
- [ ] Vant Button 圆角为胶囊形（radius-full）
- [ ] Vant Tab 激活态文字为青绿色

## 0.5 JS Theme 对象

- [ ] packages/shared/src/theme/index.ts 导出 theme 对象
- [ ] theme.colors 包含全部 17 个颜色值
- [ ] theme.fonts 包含全部字号定义
- [ ] theme.spacing 包含全部间距定义
- [ ] theme.radius 包含全部圆角定义
- [ ] theme.shadows 包含全部阴影定义
- [ ] packages/shared/src/theme/types.ts 导出 Theme 相关类型
- [ ] packages/shared/src/index.ts 导出 theme 对象和类型
- [ ] app 端 `import { theme } from '@lingqi/shared'` 成功
- [ ] `theme.colors.primary` 返回 '#4ECDC4'

## 0.6 全局样式与重置

- [ ] global.scss 定义了 page 全局背景色和文字颜色
- [ ] global.scss 定义了 image 块级显示
- [ ] reset.scss 覆盖了 uni-app/Vant 样式冲突
- [ ] main.ts 中 import 顺序正确：theme.css → vant-theme.css → global.scss → reset.scss
- [ ] 新建空白页面背景自动为 #F3F4F6
- [ ] 新建空白页面文字颜色自动为 #1F2937

## 0.7 App.vue 与页面路由骨架

- [ ] App.vue 配置全局页面容器
- [ ] App.vue 适配底部安全区
- [ ] pages.json 配置了 tabBar（首页/商品/订单/会员）
- [ ] 首页占位页面存在且可访问
- [ ] 商品占位页面存在且可访问
- [ ] 订单占位页面存在且可访问
- [ ] 会员占位页面存在且可访问
- [ ] 所有占位页面使用主题变量渲染，无硬编码样式

---

## 验收通过标准

| 检查项 | 通过标准 |
|:---|:---|
| 主题变量完整性 | 全部 42+ 个 token 已定义，覆盖颜色/字号/间距/圆角/阴影 |
| 无硬编码 | 组件 style 中无任何硬编码色值/字号/间距 |
| Vant 主题化 | Vant 组件视觉风格与设计稿一致（青绿色主色、胶囊按钮） |
| 工程可运行 | pnpm dev:h5 启动成功，tabBar 页面可切换 |
| 共享包可用 | @lingqi/shared 可被 app 和 admin 正确 import |
