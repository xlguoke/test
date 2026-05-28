# Checklist: H5 首页

> 验收标准：每个检查项必须通过视觉检查、交互测试、代码审查三重确认

---

## 1.1 页面骨架

- [ ] 首页页面 `pages/home/index.vue` 存在且可访问
- [ ] 页面根容器使用 `page-container` 工具类
- [ ] 页面背景为 var(--color-background-page)（#F3F4F6）
- [ ] 底部预留 TabBar 和购物车按钮位置（padding-bottom ≥ 120px）

## 1.2 Header 组件

- [ ] Header 固定在页面顶部
- [ ] 左侧显示机车图标 + "IRON RIDERS" 文字
- [ ] 文字样式：font-size-lg, font-weight-bold, color-text-primary
- [ ] 右侧显示消息图标（color-text-secondary）+ 会员码图标（color-primary）
- [ ] 高度 56px，padding 引用 var(--spacing-lg)
- [ ] 无硬编码色值/字号

## 1.3 Banner 轮播

- [ ] Banner 容器为白色卡片（card 工具类）
- [ ] 图片全宽，高度 160px，圆角 radius-md
- [ ] 自动播放（3 秒间隔）
- [ ] 支持左右手动滑动
- [ ] 指示器圆点：未选中 rgba(255,255,255,0.5)，选中 #FFFFFF
- [ ] 左下角叠加文字：标题 font-size-xl + 描述 font-size-sm
- [ ] "立即品尝 →" 按钮：胶囊形，背景 rgba(255,255,255,0.9)，文字 color-primary

## 1.4 分类 Tab

- [ ] 容器为白色卡片（card 工具类）
- [ ] 横向滚动，无滚动条
- [ ] Tab 项：全部、咖啡、特调、精酿、小食
- [ ] 未选中：透明背景，边框 var(--color-border)，圆角 radius-full
- [ ] 选中：背景 var(--color-primary)，文字 color-text-inverse
- [ ] 切换动画：background-color 200ms ease
- [ ] 点击切换后商品列表刷新

## 1.5 商品卡片

- [ ] 2 列网格布局，gap 引用 var(--spacing-md)
- [ ] 图片宽高比 1:1，圆角 radius-md
- [ ] 收藏按钮：右上角，心形图标
- [ ] 未收藏：color-text-tertiary；已收藏：color-secondary
- [ ] 收藏点击动画：scale 1.0→1.2→1.0，200ms
- [ ] 名称：font-size-md, font-weight-medium，单行省略
- [ ] 标签：背景 var(--color-primary-light)，文字 var(--color-primary)，font-size-xs
- [ ] 价格：font-size-lg, font-weight-bold, color-secondary
- [ ] 加号按钮：圆形 32px，背景 var(--color-primary)
- [ ] 加号点击动画：scale 1.0→0.9→1.0，100ms

## 1.6 商品网格

- [ ] 2 列 CSS Grid 布局正确
- [ ] 骨架屏：4 个灰色脉冲占位卡片
- [ ] 空状态："暂无商品" 文字 + 插图
- [ ] 下拉刷新：顶部 loading，松开后刷新
- [ ] 上滑加载：底部 loading，无更多显示 "没有更多了"
- [ ] 分类切换后列表正确刷新

## 1.7 社区入口

- [ ] 容器为白色卡片（card 工具类）
- [ ] 头部："骑士社区" + "查看更多 >"
- [ ] 横向滚动用户卡片列表
- [ ] 用户头像 48px 圆形，边框 2px solid var(--color-primary)
- [ ] 昵称 font-size-xs，单行省略
- [ ] 评论预览 font-size-xs，最多 2 行
- [ ] 点击 toast "社区功能即将上线"

## 1.8 购物车悬浮按钮

- [ ] 固定右下角，圆形 56px
- [ ] 背景 var(--color-primary)，阴影 shadow-lg
- [ ] 购物车图标 24px，color-text-inverse
- [ ] 角标：红色圆形 20px，白色数字
- [ ] 点击跳转购物车页
- [ ] 加购时角标数字 +1，按钮 scale 动画

## 1.9 TabBar

- [ ] 固定在页面底部
- [ ] 高度 56px + safe-area-bottom
- [ ] 白色背景，上边框 var(--color-border-light)
- [ ] 5 个 Tab：首页、商品、订单、会员、俱乐部
- [ ] 未选中：color-text-tertiary
- [ ] 选中：color-primary
- [ ] 点击反馈：opacity 0.7

## 1.10 数据与 Mock

- [ ] Banner 数据来自 Mock API
- [ ] 商品列表数据来自 Mock API
- [ ] 社区预览数据来自 Mock API
- [ ] 分类切换调用 Mock API 刷新
- [ ] 无 404/500 错误

## 1.11 搜索功能

- [ ] 搜索栏位于 Header 下方，白色卡片
- [ ] 圆角 radius-full，背景 var(--color-background-page)
- [ ] 搜索图标 + placeholder "搜索商品"
- [ ] 输入内容后右侧显示 × 清空按钮
- [ ] 点击搜索栏跳转搜索页
- [ ] 搜索页：搜索框自动聚焦 + 搜索历史 + 热门搜索
- [ ] 搜索结果复用 GoodsGrid 组件
- [ ] 防抖 300ms，实时搜索
- [ ] 空状态："未找到相关商品"

## 1.12 页面滚动行为

- [ ] Header 初始背景透明，滚动超过 200px 后变白色+阴影
- [ ] Header 滚动变色过渡流畅（200ms ease）
- [ ] 分类 Tab 滚动到顶部时吸顶（top: 56px）
- [ ] 分类 Tab 吸顶时增加底部阴影
- [ ] 购物车悬浮按钮始终可见

## 1.11 主题变量检查

- [ ] 所有颜色引用 CSS Variable（如 var(--color-primary)）
- [ ] 所有字号引用 CSS Variable（如 var(--font-size-md)）
- [ ] 所有间距引用 CSS Variable（如 var(--spacing-lg)）
- [ ] 所有圆角引用 CSS Variable（如 var(--radius-md)）
- [ ] 组件 style 中无任何硬编码值

---

## 验收通过标准

| 检查项 | 通过标准 |
|:---|:---|
| 视觉一致性 | 与设计稿 h5_home_fresh_2.jpg 一致（青绿色主题、圆角卡片、胶囊 Tab） |
| 交互完整性 | Banner 轮播、分类切换、收藏、加购、Tab 切换全部可用 |
| 主题配置 | 无任何硬编码色值/字号/间距，全部引用主题变量 |
| 数据加载 | Mock 数据正常加载，骨架屏→内容过渡流畅 |
| 响应式 | 2 列网格在不同屏幕宽度下布局正确 |
