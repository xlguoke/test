# Spec: H5 主题配置引擎与工程骨架

## Goal
搭建可驱动全部 H5 页面视觉表现的「主题配置系统」与 monorepo 工程骨架。所有颜色、字号、间距、圆角、阴影均通过 CSS Variables / SCSS 变量 / JS Theme 对象配置，禁止任何硬编码。设计稿风格（青绿色主色 #4ECDC4、卡片圆角 16px、大圆角按钮、柔和阴影、白色卡片）全部抽离为可配置 token。

## Done Contract
- 完成标准：packages/app 能运行，页面背景/文字/按钮颜色全部来自主题变量；切换主题变量文件后视觉风格整体变化
- 证明方式：pnpm dev:h5 启动后，检查 Elements 面板，所有颜色值必须引用 CSS 变量（如 var(--color-primary)）
- 未完成标准：存在任何硬编码色值（如 #4ECDC4、#FF4D4F 直接写在组件 style 中）

## Scope
- **In**: pnpm monorepo 结构、uni-app Vue3 工程、Vant UI 主题覆盖、CSS Variables 系统、SCSS 变量系统、JS Theme 对象、设计稿 token 映射
- **Out**: 业务页面、Mock 服务、后台管理工程（在各自独立 spec 中）

## Facts / Constraints
- **产品基准**：`full-feature-list.md` v3.0（主题配置支撑全部 H5 一期页面：首页/交易/会员）
- 设计稿主色：青绿色 #4ECDC4（按钮、Tab 激活、图标高亮）
- 设计稿辅色：深灰文字 #1F2937、次要文字 #6B7280、禁用灰 #D1D5DB
- 设计稿背景：页面背景 #F3F4F6、卡片背景 #FFFFFF
- 设计稿卡片：圆角 16px、阴影 0 4px 12px rgba(0,0,0,0.08)
- 设计稿按钮：主按钮圆角 24px（胶囊形）、高度 48px
- 设计稿 Tab：圆角胶囊形、选中背景主题色、未选中背景透明
- 技术栈：uni-app Vue3 + Vite + SCSS + Vant 4
- 路径别名：@/ → src/、@shared/ → packages/shared/src/

## Theme Token 规范（从设计稿提取）

### 颜色 Token
| Token | 值 | 用途 |
|:---|:---|:---|
| --color-primary | #4ECDC4 | 主题色（按钮、Tab 激活、图标高亮） |
| --color-primary-light | #E0F7F5 | 主题色浅（选中背景、hover 背景） |
| --color-primary-dark | #3DBDB5 | 主题色深（按钮按下态） |
| --color-secondary | #FF6B6B | 次要色（价格、角标、删除） |
| --color-secondary-light | #FFE0E0 | 次要色浅 |
| --color-text-primary | #1F2937 | 主要文字 |
| --color-text-secondary | #6B7280 | 次要文字 |
| --color-text-tertiary | #9CA3AF | 辅助文字 |
| --color-text-inverse | #FFFFFF | 反色文字（深色背景上） |
| --color-background-page | #F3F4F6 | 页面背景 |
| --color-background-card | #FFFFFF | 卡片背景 |
| --color-background-hover | #F9FAFB | hover 背景 |
| --color-border | #E5E7EB | 边框 |
| --color-border-light | #F3F4F6 | 浅边框 |
| --color-success | #10B981 | 成功 |
| --color-warning | #F59E0B | 警告 |
| --color-error | #EF4444 | 错误 |
| --color-info | #3B82F6 | 信息 |

### 字号 Token
| Token | 值 | 用途 |
|:---|:---|:---|
| --font-size-xs | 10px | 标签、角标 |
| --font-size-sm | 12px | 辅助文字、时间 |
| --font-size-base | 14px | 正文 |
| --font-size-md | 16px | 列表标题、按钮文字 |
| --font-size-lg | 18px | 页面标题、卡片标题 |
| --font-size-xl | 20px | 大标题 |
| --font-size-2xl | 24px | 价格、资产数字 |
| --font-size-3xl | 32px | 大价格 |
| --font-size-4xl | 36px | 支付金额 |
| --font-weight-normal | 400 | 正文 |
| --font-weight-medium | 500 | 强调 |
| --font-weight-bold | 600 | 标题、价格 |

### 间距 Token
| Token | 值 | 用途 |
|:---|:---|:---|
| --spacing-xs | 4px | 极小间距 |
| --spacing-sm | 8px | 小间距 |
| --spacing-md | 12px | 中间距 |
| --spacing-lg | 16px | 大间距（页面 padding） |
| --spacing-xl | 20px | 极大间距 |
| --spacing-2xl | 24px | 卡片内边距 |
| --spacing-3xl | 32px | 区块间距 |

### 圆角 Token
| Token | 值 | 用途 |
|:---|:---|:---|
| --radius-sm | 4px | 小标签 |
| --radius-md | 8px | 小卡片、图片 |
| --radius-lg | 12px | 按钮、输入框 |
| --radius-xl | 16px | 大卡片 |
| --radius-2xl | 20px | 弹窗 |
| --radius-full | 9999px | 胶囊按钮、头像 |

### 阴影 Token
| Token | 值 | 用途 |
|:---|:---|:---|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | 轻微阴影 |
| --shadow-md | 0 4px 12px rgba(0,0,0,0.08) | 卡片阴影 |
| --shadow-lg | 0 8px 24px rgba(0,0,0,0.12) | 弹窗阴影 |

## ADDED Requirements

### Requirement: 工程骨架
The system SHALL provide a pnpm monorepo with packages/app, packages/admin, packages/shared.

#### Scenario: 初始化 app 端
- **WHEN** 运行 pnpm dev:h5
- **THEN** uni-app Vue3 项目启动，浏览器可访问，Vant UI 组件可用

### Requirement: CSS Variables 主题系统
The system SHALL expose all design tokens as CSS custom properties on :root.

#### Scenario: 主题变量生效
- **GIVEN** 页面中使用 class="text-primary"
- **WHEN** 检查计算样式
- **THEN** color 值为 var(--color-primary)，而非硬编码色值

### Requirement: SCSS 变量映射
The system SHALL provide SCSS variables that map to CSS Variables for use in <style lang="scss">.

#### Scenario: SCSS 中使用主题变量
- **GIVEN** 组件 style 中书写 color: $color-primary
- **THEN** 编译后输出 color: var(--color-primary)

### Requirement: Vant UI 主题覆盖
The system SHALL override Vant 4 default theme variables to match design tokens.

#### Scenario: Vant 按钮主题化
- **GIVEN** 使用 <van-button type="primary">
- **THEN** 按钮背景色为 --color-primary，圆角为 --radius-full

### Requirement: JS Theme 对象
The system SHALL provide a JS theme object for runtime access to tokens (e.g., chart colors, dynamic styles).

#### Scenario: JS 中读取主题色
- **GIVEN** 调用 theme.colors.primary
- **THEN** 返回 '#4ECDC4'

## MODIFIED Requirements
无

## REMOVED Requirements
无

## Change Log
- 2026-05-23: 初始版本，基于设计稿提取完整 token 体系
