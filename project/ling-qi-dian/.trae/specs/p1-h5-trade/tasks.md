# Tasks: H5 商品详情、购物车、订单确认与支付

> 任务粒度：单个组件或单个页面级别，每个任务 ≤ 0.5 人日
> 依赖前提：Phase 0 主题引擎已完成，首页 spec 已完成（购物车状态共享）
> **设计契约**：[api-contracts.md](../../../mydocs/api-contracts.md) §3 商品模块 + §4 订单模块 + §5 会员模块（member-info / member-point-calculate）
> **注意**：订单状态枚举、金额单位（分）、折扣计算公式等精确值一律以契约文档为准

---

## Task 2.1: 商品详情页

- [ ] **2.1.1** 创建 `packages/app/src/pages/goods/detail.vue`
  - 页面容器：白色背景，顶部图片区 + 信息区重叠布局
  - 引入 ImageSwiper、GoodsInfo、SkuSelector、BottomAction 组件
- [ ] **2.1.2** 创建 `packages/app/src/components/goods/ImageSwiper.vue`
  - 全宽 280px，圆角 radius-xl（底部）
  - 支持左右滑动，指示器圆点
  - 返回按钮：左上角，圆形 36px，背景 rgba(0,0,0,0.3)
- [ ] **2.1.3** 创建 `packages/app/src/components/goods/GoodsInfo.vue`
  - 名称：font-size-xl, font-weight-bold
  - 评分：星星图标 + 分数
  - 标签：横向排列，主题色标签样式
  - 价格：font-size-3xl, font-weight-bold, color-secondary
  - 描述：font-size-sm，最多 3 行
- [ ] **2.1.4** 创建 `packages/app/src/components/goods/SkuSelector.vue`
  - 标题 "选择规格"
  - 规格项横向排列，选中/未选中/禁用三种状态
  - 选中：背景 var(--color-primary-light)，边框 2px solid var(--color-primary)
- [ ] **2.1.4b** 创建 `packages/app/src/components/goods/QuantitySelector.vue`
  - 步进器组件："-" / 数字 / "+"
  - 最小 1，最大 99（或库存上限）
  - 数字居中，宽度 40px
  - 数量为 1 时 "-" 禁用
- [ ] **2.1.5** 创建 `packages/app/src/components/goods/BottomAction.vue`
  - 固定底部，高度 56px + safe-area-bottom
  - 左侧：收藏按钮 + 购物车按钮（带角标）
  - 右侧："加入购物车"（主题色）+ "立即购买"（次要色）
  - 点击加入购物车：调用 useCart.addToCart，toast 提示
  - 点击立即购买：跳转订单确认页
- [ ] **2.1.6** 创建 `packages/app/src/composables/useGoodsDetail.ts`
  - 调用 Mock API `goods-detail` 获取商品详情
  - 管理 SKU 选中状态
  - 计算选中 SKU 价格
- [ ] **2.1.7** 验证：商品详情页视觉与设计稿一致，SKU 选择正常

## Task 2.2: 购物车页

- [ ] **2.2.1** 创建 `packages/app/src/pages/cart/index.vue`
  - 页面容器：page-container 工具类
  - 引入 CartHeader、CartList、CartSettlement 组件
- [ ] **2.2.2** 创建 `packages/app/src/components/cart/CartHeader.vue`
  - 标题 "购物车"，右侧 "清空" 按钮
  - 清空点击：弹出确认弹窗
- [ ] **2.2.3** 创建 `packages/app/src/components/cart/CartItem.vue`
  - 白色卡片，勾选框 + 图片 + 信息 + 数量调整
  - 勾选框：圆形，选中背景 var(--color-primary)
  - 数量调整："-" / 数字 / "+"，最小 1 时 "-" 禁用
  - 左滑删除：滑动阈值 80px，红色删除按钮
  - 失效商品：灰色遮罩 + "已下架" 标签，勾选框禁用
- [ ] **2.2.4** 创建 `packages/app/src/components/cart/CartSettlement.vue`
  - 固定底部，全选勾选框 + "已选 X 件" + 合计金额 + "去结算" 按钮
  - 未选商品时按钮禁用
  - 点击跳转订单确认页
- [ ] **2.2.5** 扩展 `useCart.ts`（已在首页 spec 中创建）
  - 添加 `selectedItems` 计算属性
  - 添加 `totalPrice` 计算属性
  - 添加 `selectAll`、`selectItem`、`updateQuantity` 方法
  - 添加 `invalidItems` 计算属性（筛选已下架商品）
  - 添加 `clearInvalid` 方法（移除所有失效商品）
- [ ] **2.2.6** 验证：购物车增删改查正常，合计金额实时计算

## Task 2.3: 订单确认页

- [ ] **2.3.1** 创建 `packages/app/src/pages/order/confirm.vue`
  - 页面容器：纵向滚动，底部预留提交栏位置
  - 引入 TableInput、RemarkInput、GoodsList、DiscountDetail、PointsDeduction、AmountDetail、SubmitBar 组件
- [ ] **2.3.2** 创建 `packages/app/src/components/order/TableInput.vue`
  - 桌号网格选择：3 列布局，常用桌号（A01-A04, B01-B02）
  - 选中态：边框 2px solid var(--color-primary)，背景 var(--color-primary-light)
  - "更多" 项：点击展开输入框，placeholder "请输入桌号"
  - 历史桌号优先显示（本地存储读取）
- [ ] **2.3.3** 创建 `packages/app/src/components/order/RemarkInput.vue`
  - 多行文本输入，placeholder，最大 200 字符
  - 字数统计 "0/200"
- [ ] **2.3.4** 创建 `packages/app/src/components/order/GoodsList.vue`
  - 商品项：图片 60x60 + 名称 + 规格 + 数量×单价
  - 分类标签：饮品/工时费/配件，不同颜色
- [ ] **2.3.5** 创建 `packages/app/src/components/order/DiscountDetail.vue`
  - 标题 "会员折扣" + 展开/折叠按钮
  - 展开显示：饮品/工时费/配件折扣明细
  - 普通用户显示 "充值成为会员享专属折扣"
- [ ] **2.3.6** 创建 `packages/app/src/components/order/PointsDeduction.vue`
  - Switch 开关 "使用积分抵扣"
  - 开启后显示可用积分、步进器、提示文字
  - 积分不足 100 时开关禁用，显示 "积分不足 100，无法使用积分抵扣"
  - 非会员显示 "充值成为会员即可使用积分抵扣"
- [ ] **2.3.7** 创建 `packages/app/src/components/order/AmountDetail.vue`
  - 商品总价、会员折扣、积分抵扣、实付金额
  - 实付金额：font-size-2xl, font-weight-bold, color-secondary
- [ ] **2.3.8** 创建 `packages/app/src/components/order/SubmitBar.vue`
  - 固定底部，"实付：¥X.XX" + "提交订单" 按钮
  - 按钮胶囊形，主题色背景
  - 点击调用 order-create Mock API
- [ ] **2.3.9** 创建 `packages/app/src/composables/useOrderConfirm.ts`
  - 计算商品总价
  - 调用 member-info 获取会员等级和折扣
  - 调用 member-point-calculate 计算可用积分
  - 计算实付金额
  - 提交订单：组装参数调用 order-create
- [ ] **2.3.10** 验证：订单确认页金额计算正确，提交订单跳转支付页

## Task 2.4: 订单支付页

- [ ] **2.4.1** 创建 `packages/app/src/pages/order/pay.vue`
  - 页面容器：垂直居中布局
  - 引入 PayAmount、PayMethod、PayButton、PayResult 组件
- [ ] **2.4.2** 创建 `packages/app/src/components/pay/PayAmount.vue`
  - 金额 "¥XX.XX"：font-size-4xl, font-weight-bold, color-secondary
  - 订单号：font-size-sm, color-text-secondary
- [ ] **2.4.3** 创建 `packages/app/src/components/pay/PayMethod.vue`
  - 微信支付选项，选中/未选中两种状态
  - 选中：边框 2px solid var(--color-primary)
- [ ] **2.4.4** 创建 `packages/app/src/components/pay/PayButton.vue`
  - 全宽按钮，"确认支付"
  - 点击显示 "支付中..."
- [ ] **2.4.5** 创建 `packages/app/src/components/pay/PayResult.vue`
  - 支付中：loading + "正在确认支付结果..."
  - 成功：绿色对勾 + "支付成功" + 订单信息 + 操作按钮
  - 失败：红色感叹号 + "支付失败" + 原因 + 操作按钮
- [ ] **2.4.6** 创建 `packages/app/src/composables/usePay.ts`
  - 调用 Mock API 模拟支付
  - 轮询查单：每 2 秒一次，最多 30 秒
  - 处理成功/失败/超时状态
- [ ] **2.4.7** 验证：支付流程完整，成功/失败状态正确

## Task 2.5: 订单列表页

- [ ] **2.5.1** 创建 `packages/app/src/pages/order/list.vue`
  - 页面容器：page-container
  - 引入 OrderTabs、OrderCard 组件
- [ ] **2.5.2** 创建 `packages/app/src/components/order/OrderTabs.vue`
  - Tab 栏：全部/待取餐/已完成/已取消/已取餐
  - 选中：color-primary + 底部主题色下划线
- [ ] **2.5.3** 创建 `packages/app/src/components/order/OrderCard.vue`
  - 白色卡片，头部（Logo + 订单号 + 状态标签）
  - 商品信息（缩略图 + 名称 + 数量）
  - 金额 + 取餐码 + 操作按钮
  - 状态标签颜色：待取餐(橙)/制作中(蓝)/已完成(绿)/已取消(红)
  - 取餐码：仅"待取餐"和"制作中"状态显示，点击弹出放大弹窗
- [ ] **2.5.3b** 创建 `packages/app/src/components/order/PickupCodeModal.vue`
  - 取餐码放大弹窗：居中大号取餐码（font-size-5xl, font-weight-bold, color-primary）
  - "关闭" 按钮（全宽）
  - 方便远距离扫码
- [ ] **2.5.3c** 创建 `packages/app/src/components/order/CancelConfirmModal.vue`
  - 取消订单确认弹窗
  - 标题："确认取消订单？"
  - 内容："取消后商品将释放库存"
  - 按钮："再想想"（灰色）+ "确认取消"（红色）
  - 取消成功：toast "订单已取消"，刷新列表
- [ ] **2.5.4** 创建 `packages/app/src/composables/useOrderList.ts`
  - 调用 Mock API `order-list`
  - 支持状态筛选
  - 分页加载
- [ ] **2.5.5** 验证：订单列表按状态筛选正常，卡片视觉与设计稿一致

## Task 2.6: 订单详情页

- [ ] **2.6.1** 创建 `packages/app/src/pages/order/detail.vue`
  - 页面容器：纵向滚动
  - 引入 StatusTimeline、GoodsList、AmountDetail、OrderInfo、ActionButtons 组件
- [ ] **2.6.2** 创建 `packages/app/src/components/order/StatusTimeline.vue`
  - 垂直时间轴：待付款 → 已支付 → 制作中 → 已完成
  - 当前状态高亮，已完成显示对勾
- [ ] **2.6.3** 创建 `packages/app/src/components/order/OrderInfo.vue`
  - 订单号、桌号、备注、创建时间、支付时间
- [ ] **2.6.4** 创建 `packages/app/src/components/order/ActionButtons.vue`
  - 待付款：取消 + 去支付
  - 已完成/已取消：再来一单
- [ ] **2.6.5** 创建 `packages/app/src/composables/useOrderDetail.ts`
  - 调用 Mock API `order-detail`
  - 处理 "再来一单"：将商品加入购物车
- [ ] **2.6.6** 验证：订单详情页状态时间轴正确，操作按钮按状态显示

## Task 2.7: Mock API 配置

- [ ] **2.7.1** 创建 `packages/shared/src/mock/handlers/goods.ts`
  - `mockGetGoodsDetail(goodsId)`：返回商品详情 + SKU 列表
- [ ] **2.7.2** 创建 `packages/shared/src/mock/handlers/order.ts`
  - `mockCreateOrder(params)`：创建订单，返回支付参数
  - `mockGetOrderList(status, page)`：返回订单列表
  - `mockGetOrderDetail(orderNo)`：返回订单详情
  - `mockPayOrder(orderNo)`：模拟支付结果
- [ ] **2.7.3** 验证：所有 Mock API 返回结构与 api-contracts.md 一致

---

> **依赖关系**：2.1 → 2.2 → 2.3 → 2.4（交易链路串行）；2.5/2.6 可与 2.3/2.4 并行
> **预计工期**：5-6 天
