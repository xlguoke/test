# Tasks: H5 主题配置引擎与工程骨架

> 任务粒度：单个文件或单个配置项级别，每个任务 ≤ 0.5 人日

---

## Task 0.1: 创建 monorepo 工程骨架

- [ ] **0.1.1** 创建根目录 `pnpm-workspace.yaml`，定义 packages: ['packages/*']
- [ ] **0.1.2** 创建根目录 `package.json`，配置统一脚本：
  - `dev:h5`: `pnpm --filter @lingqi/app dev:h5`
  - `dev:admin`: `pnpm --filter @lingqi/admin dev`
  - `build:h5`: `pnpm --filter @lingqi/app build:h5`
  - `build:admin`: `pnpm --filter @lingqi/admin build`
  - `lint`: `pnpm -r lint`
- [ ] **0.1.3** 创建根目录 `tsconfig.base.json`，配置 compilerOptions.paths：
  - `"@shared/*": ["packages/shared/src/*"]`
  - `"@/*": ["packages/app/src/*"]`（仅 app 端）
- [ ] **0.1.4** 初始化 `packages/shared/package.json`，name: `@lingqi/shared`，type: module，导出 types/utils/constants/theme
- [ ] **0.1.5** 初始化 `packages/app/package.json`，name: `@lingqi/app`，依赖 `@lingqi/shared`、`@dcloudio/uni-app`、`vant`、`sass`
- [ ] **0.1.6** 初始化 `packages/admin/package.json`，name: `@lingqi/admin`，依赖 `@lingqi/shared`
- [ ] **0.1.7** 配置 `packages/app/vite.config.ts`，配置路径别名、SCSS 预处理器、Vant 按需引入
- [ ] **0.1.8** 运行 `pnpm install`，验证无依赖冲突
- [ ] **0.1.9** 运行 `pnpm dev:h5`，验证 app 端启动成功
- [ ] **0.1.10** 验证 `@lingqi/shared` 可被 `@lingqi/app` import

## Task 0.2: 创建 CSS Variables 主题系统

- [ ] **0.2.1** 创建 `packages/app/src/styles/theme.css`，定义 :root 下全部 CSS Variables（颜色/字号/间距/圆角/阴影）
- [ ] **0.2.2** 创建 `packages/app/src/styles/theme-dark.css`（预留暗色主题，可选）
- [ ] **0.2.3** 在 `packages/app/src/main.ts` 中 import `theme.css`
- [ ] **0.2.4** 创建 `packages/app/src/styles/utilities.css`，定义工具类：
  - `.text-primary` → `color: var(--color-primary)`
  - `.bg-primary` → `background-color: var(--color-primary)`
  - `.text-secondary` → `color: var(--color-text-secondary)`
  - `.card` → `background: var(--color-background-card); border-radius: var(--radius-xl); box-shadow: var(--shadow-md)`
  - `.page-container` → `background: var(--color-background-page); padding: var(--spacing-lg)`
  - 等 20+ 个常用工具类
- [ ] **0.2.5** 验证：在 App.vue 中使用工具类，浏览器 Elements 面板显示 CSS Variable 引用

## Task 0.3: 创建 SCSS 变量映射

- [ ] **0.3.1** 创建 `packages/app/src/styles/variables.scss`，定义 SCSS 变量映射到 CSS Variables：
  ```scss
  $color-primary: var(--color-primary);
  $color-secondary: var(--color-secondary);
  // ... 全部 token
  ```
- [ ] **0.3.2** 创建 `packages/app/src/styles/mixins.scss`，定义常用 mixins：
  - `flex-center` → `display: flex; align-items: center; justify-content: center`
  - `text-ellipsis` → `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`
  - `safe-area-bottom` → `padding-bottom: constant(safe-area-inset-bottom)`
  - `card-style` → 应用卡片背景/圆角/阴影
- [ ] **0.3.3** 在 `vite.config.ts` 中配置 `css.preprocessorOptions.scss.additionalData`，自动注入 variables.scss 和 mixins.scss
- [ ] **0.3.4** 验证：在组件 `<style lang="scss">` 中使用 `$color-primary`，编译后输出 `var(--color-primary)`

## Task 0.4: Vant UI 主题覆盖

- [ ] **0.4.1** 创建 `packages/app/src/styles/vant-theme.css`，覆盖 Vant 4 CSS Variables：
  - `--van-primary-color: var(--color-primary)`
  - `--van-button-primary-background: var(--color-primary)`
  - `--van-button-primary-border-color: var(--color-primary)`
  - `--van-button-border-radius: var(--radius-full)`
  - `--van-tab-active-text-color: var(--color-primary)`
  - `--van-nav-bar-background: var(--color-background-card)`
  - 等 30+ 个 Vant 变量映射
- [ ] **0.4.2** 在 `main.ts` 中 import `vant-theme.css`（在 theme.css 之后）
- [ ] **0.4.3** 创建测试页面 `packages/app/src/pages/test/theme.vue`，展示 Vant 组件（Button、Tab、Cell、Tag）主题化效果
- [ ] **0.4.4** 验证：Vant Button primary 类型显示为青绿色 #4ECDC4，圆角为胶囊形

## Task 0.5: 创建 JS Theme 对象

- [ ] **0.5.1** 创建 `packages/shared/src/theme/index.ts`，导出 theme 对象：
  ```typescript
  export const theme = {
    colors: {
      primary: '#4ECDC4',
      primaryLight: '#E0F7F5',
      primaryDark: '#3DBDB5',
      secondary: '#FF6B6B',
      // ... 全部颜色
    },
    fonts: {
      sizeXs: '10px',
      sizeSm: '12px',
      // ... 全部字号
    },
    spacing: {
      xs: '4px',
      // ... 全部间距
    },
    radius: {
      sm: '4px',
      // ... 全部圆角
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      // ... 全部阴影
    }
  } as const;
  ```
- [ ] **0.5.2** 创建 `packages/shared/src/theme/types.ts`，定义 Theme 类型：
  ```typescript
  export type ThemeColors = keyof typeof theme.colors;
  export type ThemeFontSizes = keyof typeof theme.fonts;
  // ...
  ```
- [ ] **0.5.3** 导出共享包入口 `packages/shared/src/index.ts`，导出 theme 对象和类型
- [ ] **0.5.4** 验证：在 app 端 `import { theme } from '@lingqi/shared'`，`theme.colors.primary` 返回 '#4ECDC4'

## Task 0.6: 创建全局样式与重置

- [ ] **0.6.1** 创建 `packages/app/src/styles/global.scss`，定义全局样式：
  - `page` → `background-color: var(--color-background-page); color: var(--color-text-primary); font-size: var(--font-size-base)`
  - `image` → `display: block; max-width: 100%`
  - 禁用 uni-app 默认 button 样式重置
- [ ] **0.6.2** 创建 `packages/app/src/styles/reset.scss`，覆盖 uni-app/Vant 默认样式冲突
- [ ] **0.6.3** 在 `main.ts` 中按顺序 import：theme.css → vant-theme.css → global.scss → reset.scss
- [ ] **0.6.4** 验证：新建空白页面，背景自动为 #F3F4F6，文字颜色为 #1F2937

## Task 0.7: 创建 App.vue 与页面路由骨架

- [ ] **0.7.1** 创建 `packages/app/src/App.vue`，配置全局页面容器、底部安全区适配
- [ ] **0.7.2** 创建 `packages/app/src/pages.json`，配置 tabBar 页面（首页/商品/订单/会员）
- [ ] **0.7.3** 创建占位页面：
  - `packages/app/src/pages/home/index.vue`
  - `packages/app/src/pages/goods/index.vue`
  - `packages/app/src/pages/order/index.vue`
  - `packages/app/src/pages/member/index.vue`
- [ ] **0.7.4** 每个占位页面使用主题变量渲染测试内容，验证主题系统全局生效

---

> **依赖关系**：0.1 → 0.2 → 0.3 → 0.4 → 0.5 → 0.6 → 0.7（串行）
> **预计工期**：2 天
