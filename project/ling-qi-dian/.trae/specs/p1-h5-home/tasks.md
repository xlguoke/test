# Tasks: H5 首页

> 任务粒度：单个组件或单个交互效果级别，每个任务 ≤ 0.5 人日
> 依赖前提：Phase 0 主题引擎已完成（packages/app 可运行，主题变量可用）
> **设计契约**：[api-contracts.md](../../../mydocs/api-contracts.md) §3 商品模块（goods-list）
> **注意**：GoodsItem 字段名、分页参数等精确值一律以契约文档为准

---

## Task 1.1: 创建首页页面骨架

- [ ] **1.1.1** 创建 `packages/app/src/pages/home/index.vue`，配置页面级容器
  - 使用 `page-container` 工具类作为根容器
  - 引入 Header、Banner、CategoryTab、GoodsGrid、CommunityEntry 组件
  - 底部预留 TabBar 和购物车悬浮按钮位置（padding-bottom: 120px）
- [ ] **1.1.2** 创建 `packages/app/src/composables/useHome.ts`，首页数据逻辑
  - 定义 `fetchBanners()`：调用 Mock API 获取 Banner 数据
  - 定义 `fetchGoods(category, page)`：调用 Mock API 获取商品列表
  - 定义 `fetchCommunityPreview()`：调用 Mock API 获取社区预览数据
  - 使用 `ref` 管理加载状态、错误状态、分页状态
- [ ] **1.1.3** 验证：首页页面可访问，背景为 var(--color-background-page)

## Task 1.2: Header 组件

- [ ] **1.2.1** 创建 `packages/app/src/components/home/Header.vue`
  - 布局：flex row，justify-between，align-center
  - 左侧：机车图标（24px SVG，color-text-primary）+ "IRON RIDERS"（font-size-lg, font-weight-bold）
  - 右侧：消息图标（24px，color-text-secondary）+ 会员码图标（24px，color-primary）
  - 高度：56px，padding: 0 var(--spacing-lg)
  - 点击会员码图标：弹出会员码弹窗（调用 MemberCode 组件）
  - 滚动变色：position: sticky, top: 0, 滚动超过 200px 后背景变白+底部阴影
- [ ] **1.2.2** 创建 `packages/app/src/components/icons/MotorcycleIcon.vue`，机车 SVG 图标组件
- [ ] **1.2.3** 验证：Header 按设计稿呈现，图标颜色引用主题变量

## Task 1.3: Banner 轮播组件

- [ ] **1.3.1** 创建 `packages/app/src/components/home/BannerSwiper.vue`
  - 容器：白色卡片（card 工具类），margin: var(--spacing-lg)
  - 使用 `swiper` 组件实现轮播（uni-app 内置或 vant Swipe）
  - 图片：全宽，高度 160px，圆角 radius-md
  - 自动播放：interval 3000ms，circular
  - 指示器：底部居中，圆点样式
    - 未选中：8px，rgba(255,255,255,0.5)
    - 选中：8px，#FFFFFF
  - 内容叠加：左下角文字区域
    - 标题：font-size-xl, font-weight-bold, color-text-inverse
    - 描述：font-size-sm, color-text-inverse，带 rgba(0,0,0,0.3) 背景
    - "立即品尝 →" 按钮：胶囊形，背景 rgba(255,255,255,0.9)，文字 color-primary，font-size-sm
- [ ] **1.3.2** 创建 `packages/app/src/composables/useBanner.ts`，Banner 数据逻辑
  - 定义 Banner 数据类型：`{ id, image, title, description, link }`
  - 调用 Mock API 获取 Banner 列表
- [ ] **1.3.3** 验证：Banner 自动轮播，指示器同步，手动滑动正常

## Task 1.4: 分类 Tab 组件

- [ ] **1.4.1** 创建 `packages/app/src/components/home/CategoryTab.vue`
  - 容器：白色卡片（card 工具类），padding: var(--spacing-md)
  - 布局：横向滚动（overflow-x: auto, white-space: nowrap, scrollbar-width: none）
  - Tab 项：flex inline-block，gap: var(--spacing-sm)
  - 样式：
    - 未选中：背景透明，边框 1px solid var(--color-border)，圆角 radius-full，padding: var(--spacing-sm) var(--spacing-lg)，文字 color-text-secondary, font-size-sm
    - 选中：背景 var(--color-primary)，无边框，文字 color-text-inverse, font-weight-medium
    - 过渡：background-color 200ms ease, color 200ms ease
  - 分类列表：全部、咖啡、特调、精酿、小食
  - 点击事件：emit('change', category)，切换商品列表
- [ ] **1.4.2** 验证：Tab 切换动画流畅，选中态视觉正确

## Task 1.5: 商品卡片组件

- [ ] **1.5.1** 创建 `packages/app/src/components/home/GoodsCard.vue`
  - Props：`{ goods: GoodsItem }`
  - 布局：相对定位容器
  - 图片：宽高比 1:1，圆角 radius-md，object-fit: cover
  - 收藏按钮：右上角绝对定位（top: var(--spacing-sm), right: var(--spacing-sm)）
    - 心形图标 24px
    - 未收藏：color-text-tertiary
    - 已收藏：color-secondary
    - 点击：emit('favorite', goods.id)，播放 scale 1.0→1.2→1.0 动画（200ms）
  - 名称：font-size-md, font-weight-medium, color-text-primary，单行省略（text-ellipsis mixin）
  - 标签：横向排列，gap: var(--spacing-xs)
    - 标签样式：背景 var(--color-primary-light)，文字 var(--color-primary)，font-size-xs，圆角 radius-sm，padding: 2px 6px
  - 价格：font-size-lg, font-weight-bold, color-secondary
  - 加号按钮：右下角绝对定位（bottom: var(--spacing-sm), right: var(--spacing-sm)）
    - 圆形 32px，背景 var(--color-primary)
    - "+" 图标：font-size-lg, color-text-inverse
    - 点击：emit('add-cart', goods)，播放 scale 1.0→0.9→1.0 动画（100ms）
- [ ] **1.5.2** 验证：商品卡片视觉与设计稿一致，交互动画正常

## Task 1.6: 商品网格组件

- [ ] **1.6.1** 创建 `packages/app/src/components/home/GoodsGrid.vue`
  - Props：`{ category: string }`
  - 布局：2 列 CSS Grid，gap: var(--spacing-md)
  - 引入 GoodsCard 组件，循环渲染
  - 加载状态：骨架屏（4 个占位卡片）
    - 灰色背景脉冲动画（animation: pulse 1.5s infinite）
  - 空状态：居中显示 "暂无商品" + 插图（color-text-tertiary）
  - 下拉刷新：使用 uni-app `scroll-view` 或 `onPullDownRefresh`
  - 上滑加载：底部 loading 动画，无更多数据显示 "没有更多了"
- [ ] **1.6.2** 创建 `packages/app/src/composables/useGoods.ts`，商品数据逻辑
  - 定义 `GoodsItem` 类型（与 api-contracts.md 一致）
  - `fetchGoodsList(category, page, pageSize)`：调用 Mock API
  - `loading`、`error`、`hasMore`、`goodsList` 状态管理
  - 分页逻辑：page 递增，hasMore 判断
- [ ] **1.6.3** 验证：商品网格 2 列布局正确，下拉刷新和上滑加载正常

## Task 1.7: 社区入口组件

- [ ] **1.7.1** 创建 `packages/app/src/components/home/CommunityEntry.vue`
  - 容器：白色卡片（card 工具类）
  - 头部：flex row，justify-between
    - 左侧："骑士社区"（font-size-lg, font-weight-bold, color-text-primary）
    - 右侧："查看更多 >"（font-size-sm, color-primary）
  - 内容：横向滚动，flex 排列，gap: var(--spacing-md)
  - 用户卡片：
    - 头像：48px 圆形，border: 2px solid var(--color-primary)
    - 昵称：font-size-xs, color-text-primary，最大宽度 60px，单行省略
    - 评论预览：font-size-xs, color-text-secondary，最多 2 行
    - 时间：font-size-xs, color-text-tertiary
  - 点击：toast "社区功能即将上线"（二期预留）
- [ ] **1.7.2** 验证：社区入口视觉正确，横向滚动流畅

## Task 1.8: 购物车悬浮按钮

- [ ] **1.8.1** 创建 `packages/app/src/components/common/CartFloatButton.vue`
  - 位置：fixed，right: var(--spacing-lg)，bottom: calc(56px + var(--spacing-lg) + env(safe-area-inset-bottom))
  - 容器：圆形 56px，背景 var(--color-primary)，阴影 shadow-lg
  - 图标：购物车 24px，color-text-inverse
  - 角标：右上角绝对定位，红色圆形 20px，白色数字 font-size-xs
  - 点击：跳转购物车页（`uni.navigateTo({ url: '/pages/cart/index' })`）
  - 加购动画：角标数字变化时，容器 scale 1.0→1.1→1.0（200ms）
- [ ] **1.8.2** 创建 `packages/app/src/composables/useCart.ts`，购物车状态管理
  - 使用 Pinia store
  - State：`cartItems: CartItem[]`，`totalCount: number`
  - Actions：`addToCart(goods)`，`removeFromCart(goodsId)`，`clearCart()`
  - 持久化：localStorage
- [ ] **1.8.3** 验证：点击加号按钮，角标数字 +1，动画播放；点击悬浮按钮跳转购物车

## Task 1.9: TabBar 组件

- [ ] **1.9.1** 创建 `packages/app/src/components/common/TabBar.vue`
  - 位置：fixed bottom，高度 56px + safe-area-bottom
  - 背景：白色，上边框 1px solid var(--color-border-light)
  - 布局：5 等分，flex 排列
  - Tab 项：
    - 图标：24px（使用 uni-icons 或自定义 SVG）
    - 文字：font-size-xs
    - 未选中：color-text-tertiary
    - 选中：color-primary
    - 点击反馈：opacity 0.7，100ms
  - Tab 列表：
    1. 首页（home）- 选中
    2. 商品（goods）
    3. 订单（order）
    4. 会员（member）
    5. 俱乐部（club）- 二期预留
  - 点击：emit('switch', tabName)，调用 `uni.switchTab`
- [ ] **1.9.2** 验证：TabBar 在页面底部固定，切换高亮正常

## Task 1.10: 首页数据联调

- [ ] **1.10.1** 在 `pages/home/index.vue` 中组合所有组件
  - 引入 Header、BannerSwiper、CategoryTab、GoodsGrid、CommunityEntry
  - 引入 CartFloatButton、TabBar
  - 使用 `useHome` composable 获取数据
  - 分类切换时调用 `fetchGoods` 刷新商品列表
- [ ] **1.10.2** 配置 Mock API：在 `packages/shared/src/mock/handlers/home.ts` 中创建
  - `mockGetBanners()`：返回 3 条 Banner 数据
  - `mockGetGoodsList(category, page)`：返回分页商品数据
  - `mockGetCommunityPreview()`：返回 5 条社区预览数据
- [ ] **1.10.3** 验证：首页完整呈现，所有数据来自 Mock，交互正常

## Task 1.11: 搜索功能

- [ ] **1.11.1** 创建 `packages/app/src/components/home/SearchBar.vue`
  - 容器：白色卡片（card 工具类），margin: 0 var(--spacing-lg) var(--spacing-lg)
  - 样式：圆角 radius-full，背景 var(--color-background-page)
  - 左侧搜索图标（20px, color-text-tertiary）+ placeholder "搜索商品"
  - 右侧清空按钮（输入内容后显示 × 图标，20px, color-text-tertiary）
  - 点击：跳转搜索页或展开搜索框
  - 防抖 300ms，实时搜索
- [ ] **1.11.2** 创建 `packages/app/src/pages/search/index.vue`
  - 搜索页：顶部搜索框（自动聚焦）+ 搜索历史 + 热门搜索 + 搜索结果列表
  - 搜索历史：横向标签，最多 10 条，支持清空
  - 热门搜索：横向标签，固定数据
  - 搜索结果：复用 GoodsGrid 组件
  - 空状态："未找到相关商品"
- [ ] **1.11.3** 创建 `packages/app/src/composables/useSearch.ts`
  - 定义搜索关键词状态
  - 防抖搜索逻辑（300ms）
  - 搜索历史管理（localStorage）
  - 调用 Mock API goods-list（keyword 参数）
- [ ] **1.11.4** 验证：搜索栏点击跳转搜索页，输入关键词显示搜索结果，清空按钮正常

## Task 1.12: 页面滚动行为

- [ ] **1.12.1** Header 滚动变色
  - 初始状态：Header 背景透明
  - 滚动超过 200px：背景变白色 + 底部阴影
  - 实现：监听 scroll 事件或 IntersectionObserver，动态添加 header--scrolled 类
  - 过渡：background-color 200ms ease
- [ ] **1.12.2** 分类 Tab 吸顶
  - 分类 Tab 滚动到顶部时吸顶
  - 吸顶位置：top: 56px（Header 高度之下）
  - 吸顶时增加底部阴影
  - 实现：position: sticky, top: 56px, z-index: 99
- [ ] **1.12.3** 验证：Header 滚动变色流畅，分类 Tab 吸顶正常

---

> **依赖关系**：1.1 → 1.2~1.9（并行）→ 1.10（联调）→ 1.11~1.12（搜索+滚动）
> **预计工期**：3-4 天
