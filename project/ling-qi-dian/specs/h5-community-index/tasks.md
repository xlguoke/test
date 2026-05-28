# h5-community-index Tasks v5.0

---

## Phase 1: 页面骨架

- [ ] 1.1 创建页面文件（.vue/.tsx 等，依项目技术栈）
- [ ] 1.2 配置页面路由
- [ ] 1.3 引入社区模块 API 封装（postList, postLike）

## Phase 2: 瀑布流列表

- [ ] 2.1 实现两列瀑布流布局组件
  - 计算左右列高度，新卡片放入较矮列
  - 图片自适应（mode="widthFix" 或 CSS aspect-ratio）
- [ ] 2.2 帖子卡片组件
  - 头像、昵称、图片网格（1张大图 / 2~4张四宫格 / 5~9张九宫格）
  - 文字内容 2 行省略
  - 点赞按钮、评论数展示

## Phase 3: 交互功能

- [ ] 3.1 点赞动画
  - CSS transition / animation 实现 scale 1.0→1.3→1.0，200ms
  - 颜色切换 #999 ↔ #FF4D4F
- [ ] 3.2 图片预览
  - 调用平台预览 API（如微信小程序 `wx.previewImage`）
  - 传入当前图片索引
- [ ] 3.3 下拉刷新
  - onPullDownRefresh 或自定义手势
  - 重置 page=1，重新请求
- [ ] 3.4 上拉加载更多
  - onReachBottom 或滚动监听
  - page++，追加数据
  - 控制 hasMore 状态

## Phase 4: 边界与优化

- [ ] 4.1 空状态处理
- [ ] 4.2 网络错误提示
- [ ] 4.3 图片懒加载
- [ ] 4.4 列表项 key 稳定，避免闪烁

---

## 优先级

P0: 1.x, 2.x, 3.4（列表展示 + 加载更多）
P1: 3.1, 3.2, 3.3（交互增强）
P2: 4.x（体验优化）
