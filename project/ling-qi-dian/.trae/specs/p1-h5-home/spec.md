# Spec: H5 首页

## Goal
实现机车俱乐部 H5 首页，严格遵循设计稿 `h5_home_fresh_2.jpg` 的视觉风格。首页包含品牌 Header、Banner 轮播、分类 Tab、商品网格、社区入口、底部 TabBar 六大板块。所有颜色/字号/间距/圆角均引用主题变量，禁止硬编码。

## Done Contract
- 完成标准：首页所有板块按设计稿呈现，交互流畅，Mock 数据正常加载
- 证明方式：浏览器访问首页，视觉与设计稿一致（青绿色主题、圆角卡片、胶囊 Tab）；点击分类切换商品列表刷新；点击商品进入详情页
- 未完成标准：存在硬编码样式、板块缺失、交互未实现

## Scope
- **In**: 首页全部板块（Header、Banner、CategoryTab、GoodsGrid、CommunityEntry、TabBar）
- **Out**: 商品详情页、社区广场页、购物车（在各自独立 spec 中）

## Facts / Constraints
- **产品基准**：`full-feature-list.md` v3.0 §1（H5-HOME-001~008）+ §12（H5-TABLE-001~002）
- 设计稿主色：青绿色 #4ECDC4
- 设计稿风格：白色圆角卡片（radius-xl）、柔和阴影（shadow-md）、胶囊形 Tab
- 商品卡片：2 列网格、图片圆角（radius-md）、心形收藏按钮、加号添加按钮
- Banner：全宽轮播、圆角卡片内嵌、指示器圆点
- 分类 Tab：全部/咖啡/特调/精酿/小食，胶囊形，选中背景主题色+白字
- 底部 TabBar：首页/商品/订单/会员/俱乐部（5 个），图标+文字，选中主题色
- 社区入口：横向滚动用户头像列表，显示昵称和评论预览
- 数据：基于 Mock API（goods-list）
- **设计契约文件**（字段定义、接口结构的唯一来源，禁止猜测）：
  - 接口字段 → [api-contracts.md](../../../mydocs/api-contracts.md) §3 商品模块（goods-list）

## 板块详细规范

### 1. Header（品牌区）
- **位置**：页面最顶部，固定高度 56px
- **背景**：透明（滚动后可变为白色带阴影，可选）
- **内容**：
  - 左侧：机车图标（24px）+ "IRON RIDERS" 文字（font-size-lg, font-weight-bold, color-text-primary）
  - 右侧：消息图标（24px, color-text-secondary）+ 会员码图标（24px, color-primary）
- **间距**：padding: 0 var(--spacing-lg)

### 2. Banner 轮播
- **容器**：白色卡片（card 工具类），margin: var(--spacing-lg)
- **图片**：全宽，高度 160px，圆角 radius-md
- **轮播**：自动播放（3 秒间隔），支持左右滑动
- **指示器**：底部居中，圆点样式
  - 未选中：8px 圆点，rgba(255,255,255,0.5)
  - 选中：8px 圆点，#FFFFFF
- **内容叠加**：图片左下角叠加文字
  - 标题：font-size-xl, font-weight-bold, color-text-inverse
  - 描述：font-size-sm, color-text-inverse, 带半透明背景
  - "立即品尝 →" 按钮：胶囊形，背景 rgba(255,255,255,0.9)，文字 color-primary

### 3. 分类 Tab
- **容器**：白色卡片（card 工具类），margin: 0 var(--spacing-lg) var(--spacing-lg)
- **布局**：横向滚动，flex 排列，gap: var(--spacing-sm)
- **Tab 项**：
  - 未选中：背景透明，边框 1px solid var(--color-border)，圆角 radius-full，padding: var(--spacing-sm) var(--spacing-lg)，文字 color-text-secondary, font-size-sm
  - 选中：背景 var(--color-primary)，无边框，文字 color-text-inverse, font-weight-medium
  - 切换动画：背景色过渡 200ms ease
- **分类列表**：全部、咖啡、特调、精酿、小食

### 4. 商品网格
- **容器**：白色卡片（card 工具类），margin: 0 var(--spacing-lg) var(--spacing-lg)
- **布局**：2 列网格，gap: var(--spacing-md)
- **商品卡片**：
  - 图片：宽高比 1:1，圆角 radius-md，object-fit: cover
  - 收藏按钮：右上角绝对定位，心形图标（24px）
    - 未收藏：color-text-tertiary
    - 已收藏：color-secondary（红色）
    - 点击动画：scale 1.0→1.2→1.0，200ms
  - 名称：font-size-md, font-weight-medium, color-text-primary, 单行省略
  - 标签：横向排列，gap: var(--spacing-xs)
    - 标签样式：背景 var(--color-primary-light)，文字 var(--color-primary)，font-size-xs，圆角 radius-sm，padding: 2px 6px
  - 价格：font-size-lg, font-weight-bold, color-secondary
  - 加号按钮：右下角绝对定位，圆形，32px，背景 var(--color-primary)，文字 color-text-inverse，font-size-lg
    - 点击动画：scale 1.0→0.9→1.0，100ms
    - 点击后：购物车角标 +1（动画在全局购物车按钮上）
- **加载状态**：骨架屏（4 个占位卡片，灰色脉冲动画）
- **空状态**："暂无商品" 插图 + 文字（color-text-tertiary）
- **下拉刷新**：顶部 loading 动画，松开后刷新列表
- **上滑加载**：底部 loading，无更多数据时显示 "没有更多了"（color-text-tertiary, font-size-sm）

### 1.5 搜索栏
- **位置**：Header 下方，独立白色卡片（card 工具类），margin: 0 var(--spacing-lg) var(--spacing-lg)
- **样式**：圆角 radius-full，背景 var(--color-background-page)
- **左侧**：搜索图标（20px, color-text-tertiary）
- **中间**：placeholder "搜索商品"（font-size-sm, color-text-tertiary）
- **右侧**：清空按钮（输入内容后显示 × 图标，20px, color-text-tertiary）
- **交互**：
  - 点击：跳转搜索页（pages/search/index.vue）或展开搜索框
  - 输入防抖 300ms，实时搜索
  - 清空按钮：点击清空输入内容

### 1.6 社区入口（骑士社区）
- **容器**：白色卡片（card 工具类），margin: 0 var(--spacing-lg) var(--spacing-lg)
- **头部**：
  - 左侧："骑士社区" 文字（font-size-lg, font-weight-bold, color-text-primary）
  - 右侧："查看更多 >" 文字（font-size-sm, color-primary）
- **内容**：横向滚动，flex 排列，gap: var(--spacing-md)
- **用户卡片**：
  - 头像：48px 圆形，border: 2px solid var(--color-primary)
  - 昵称：font-size-xs, color-text-primary，最大宽度 60px，单行省略
  - 评论预览：font-size-xs, color-text-secondary，最多 2 行
  - 时间：font-size-xs, color-text-tertiary
- 点击：跳转社区广场页（二期功能，一期预留入口）
- **Mock 数据结构**：
  ```typescript
  interface CommunityPreviewItem {
    id: string
    avatar: string
    nickname: string
    contentPreview: string
    time: string
  }
  ```

### 1.7 底部 TabBar
- **位置**：页面底部，固定高度 56px + safe-area-bottom
- **背景**：白色，上边框 1px solid var(--color-border-light)
- **布局**：5 等分，flex 排列
- **Tab 项**：
  - 图标：24px，未选中 color-text-tertiary，选中 color-primary
  - 文字：font-size-xs，未选中 color-text-tertiary，选中 color-primary
  - 选中态：图标上方无指示器，仅颜色变化
  - 点击反馈：opacity 0.7，100ms
- **Tab 列表**：首页、商品、订单、会员、俱乐部
- **购物车全局按钮**：页面右下角悬浮，圆形 56px，背景 var(--color-primary)，阴影 shadow-lg
  - 图标：购物车 24px，color-text-inverse
  - 角标：红色圆形 20px，白色数字 font-size-xs
  - 点击：跳转购物车页
  - 加购动画：角标数字变化时，按钮 scale 1.0→1.1→1.0，200ms

## 页面滚动行为规范

### Header 滚动变色
- **初始状态**：Header 背景透明
- **滚动阈值**：滚动超过 Banner 区域（约 200px）后
- **变化后**：Header 背景变为白色 + 底部阴影（box-shadow: 0 2px 8px rgba(0,0,0,0.06)）
- **过渡**：background-color 200ms ease
- **实现**：position: sticky, top: 0, z-index: 100

### 分类 Tab 吸顶
- **触发条件**：分类 Tab 滚动到页面顶部时
- **吸顶位置**：top: 56px（Header 高度之下）
- **实现**：position: sticky, top: 56px, z-index: 99
- **吸顶时**：增加底部阴影，与 Header 阴影一致

### 购物车悬浮按钮
- **滚动行为**：始终可见，不随页面滚动
- **实现**：position: fixed

## ADDED Requirements

### Requirement: 商品列表加载
The system SHALL display goods in a 2-column grid with image, name, tags, price, and add-to-cart button.

#### Scenario: 加载商品列表
- **GIVEN** 用户进入首页
- **WHEN** 页面加载完成
- **THEN** 显示骨架屏 → 加载完成后显示商品网格

#### Scenario: 分类切换
- **GIVEN** 用户点击"咖啡"分类
- **WHEN** 分类切换
- **THEN** 商品列表刷新，显示咖啡类商品，当前 Tab 高亮

#### Scenario: 添加购物车
- **GIVEN** 用户点击商品卡片上的"+"按钮
- **WHEN** 点击完成
- **THEN** 购物车角标 +1，按钮播放缩放动画

### Requirement: Banner 轮播
The system SHALL display auto-playing banner carousel with indicator dots.

#### Scenario: Banner 自动播放
- **GIVEN** 用户在首页
- **WHEN** 等待 3 秒
- **THEN** Banner 自动切换到下一张

#### Scenario: Banner 手动滑动
- **GIVEN** 用户手指放在 Banner 上
- **WHEN** 左右滑动
- **THEN** Banner 跟随手指滑动，松开后切换到对应图片

### Requirement: 收藏功能
The system SHALL allow users to favorite/unfavorite goods.

#### Scenario: 收藏商品
- **GIVEN** 用户点击未收藏商品的心形图标
- **WHEN** 点击完成
- **THEN** 心形变为红色，播放缩放动画

## MODIFIED Requirements
无

## REMOVED Requirements
- 社区广场内容（二期开发，一期仅保留入口）
- 消息中心（二期开发）

## Change Log
- 2026-05-23: 初始版本，基于设计稿 h5_home_fresh_2.jpg 制定
