# Spec: H5 商品详情、购物车、订单确认与支付

## Goal
实现机车俱乐部 H5 交易链路：商品详情页 → 购物车 → 订单确认 → 订单支付 → 订单管理。严格遵循设计稿 `h5_products_fresh_2.jpg` 和 `h5_orders_fresh_2.jpg` 的视觉风格。所有颜色/字号/间距/圆角均引用主题变量，禁止硬编码。

## Done Contract
- 完成标准：交易链路完整闭环，从商品浏览到支付成功全部可用，Mock 数据正常
- 证明方式：浏览器端完成：点击商品进入详情 → 加入购物车 → 进入购物车结算 → 订单确认 → 模拟支付 → 查看订单列表
- 未完成标准：链路中断、硬编码样式、交互缺失

## Scope
- **In**: 商品详情页、购物车页、订单确认页、订单支付页、订单列表页、订单详情页
- **Out**: 会员中心、社区、后台管理（在各自独立 spec 中）

## Facts / Constraints
- **产品基准**：`full-feature-list.md` v3.0 §2~§5（H5-CART-001~005 / H5-ORDER-CONFIRM-001~007 / H5-PAY-001~007 / H5-ORDER-LIST-001~007）
- 设计稿主色：青绿色 #4ECDC4
- 商品详情页（h5_products_fresh_2.jpg 风格）：大图展示、SKU 选择、标签、评分、加购按钮
- 订单页（h5_orders_fresh_2.jpg 风格）：白色卡片、状态标签、商品缩略图、取餐码
- 购物车：左滑删除、数量调整、全选、合计
- 订单确认：桌号输入、备注、会员折扣、积分抵扣
- 支付：收钱吧 JSAPI 支付、轮询查单
- 数据：基于 Mock API（goods-detail、cart、order-create、order-list 等）
- **设计契约文件**（字段定义、接口结构的唯一来源，禁止猜测）：
  - 接口字段 → [api-contracts.md](../../../mydocs/api-contracts.md) §3 商品模块（goods-detail）+ §4 订单模块（order-create / order-pay-callback / order-list / order-detail / refund-request / member-reconnect）+ §5 会员模块（member-info / member-point-calculate / member-balance-pay）

---

## 板块详细规范

### 1. 商品详情页（pages/goods/detail.vue）

#### 1.1 顶部图片区
- **布局**：全宽，高度 280px，圆角 radius-xl（底部）
- **轮播**：支持左右滑动，指示器圆点（底部居中）
- **返回按钮**：左上角绝对定位，圆形 36px，背景 rgba(0,0,0,0.3)，白色返回箭头
- **分享按钮**：右上角绝对定位，同返回按钮样式

#### 1.2 商品信息区
- **容器**：白色卡片（card 工具类），margin-top: -20px（与图片重叠），圆角 radius-xl（顶部）
- **名称**：font-size-xl, font-weight-bold, color-text-primary
- **评分**：星星图标（5 颗，color-warning）+ 分数（font-size-sm, color-text-secondary）
- **标签**：横向排列，gap: var(--spacing-xs)
  - 标签样式：背景 var(--color-primary-light)，文字 var(--color-primary)，font-size-xs，圆角 radius-sm，padding: 2px 8px
- **价格**：font-size-3xl, font-weight-bold, color-secondary
- **描述**：font-size-sm, color-text-secondary，最多 3 行

#### 1.3 SKU 选择区
- **标题**："选择规格"（font-size-md, font-weight-medium, color-text-primary）
- **规格项**：横向排列，gap: var(--spacing-sm)
  - 未选中：背景 var(--color-background-page)，边框 1px solid var(--color-border)，圆角 radius-md，padding: var(--spacing-sm) var(--spacing-md)
  - 选中：背景 var(--color-primary-light)，边框 2px solid var(--color-primary)，圆角 radius-md
  - 禁用：背景 var(--color-background-page)，文字 var(--color-text-tertiary)，不可点击
  - 文字：font-size-sm，未选中 color-text-secondary，选中 color-primary

#### 1.3b 数量选择器
- **位置**：SKU 选择区下方，白色卡片（card 工具类）
- **布局**：flex row，justify-between，align-center
- **左侧**："数量" 文字（font-size-md, font-weight-medium, color-text-primary）
- **右侧**：步进器组件
  - "-" 按钮：圆形 28px，边框 1px solid var(--color-border)，font-size-md, color-text-primary
  - 数量：font-size-md, color-text-primary，宽度 40px，居中
  - "+" 按钮：圆形 28px，背景 var(--color-primary)，font-size-md, color-text-inverse
  - 最小 1（数量为 1 时 "-" 禁用，color-text-tertiary）
  - 最大 99（或库存上限）

#### 1.4 底部操作栏
- **位置**：fixed bottom，高度 56px + safe-area-bottom
- **背景**：白色，上边框 var(--color-border-light)
- **左侧**：收藏按钮（心形图标，40px）+ 购物车按钮（购物车图标 + 角标）
- **右侧**：
  - "加入购物车" 按钮：胶囊形，背景 var(--color-primary)，文字 color-text-inverse，font-size-md
  - "立即购买" 按钮：胶囊形，背景 var(--color-secondary)，文字 color-text-inverse，font-size-md
- **按钮点击**：
  - 加入购物车：调用 useCart.addToCart，toast "已加入购物车"，返回上一页
  - 立即购买：跳转订单确认页，携带商品数据

---

### 2. 购物车页（pages/cart/index.vue）

#### 2.1 页面头部
- **标题**："购物车"（font-size-lg, font-weight-bold, color-text-primary）
- **右侧**："清空" 文字按钮（font-size-sm, color-text-secondary）
  - 点击：弹出确认弹窗 "确定清空购物车？"

#### 2.2 商品列表
- **布局**：纵向排列，gap: var(--spacing-md)
- **商品卡片**：白色卡片（card 工具类），padding: var(--spacing-md)
  - 左侧：勾选框（圆形，24px）
    - 未选中：边框 2px solid var(--color-border)
    - 选中：背景 var(--color-primary)，白色对勾图标
  - 图片：80x80px，圆角 radius-md
  - 信息区：
    - 名称：font-size-md, font-weight-medium, color-text-primary
    - 规格：font-size-sm, color-text-secondary
    - 单价：font-size-sm, color-secondary
  - 数量调整：
    - "-" 按钮：圆形 28px，边框 1px solid var(--color-border)，font-size-md, color-text-primary
    - 数量：font-size-md, color-text-primary，宽度 40px，居中
    - "+" 按钮：圆形 28px，背景 var(--color-primary)，font-size-md, color-text-inverse
    - 最小 1 时 "-" 禁用（color-text-tertiary）
  - **左滑删除**：
    - 左滑显示删除按钮（红色背景，白色"删除"文字）
    - 点击确认删除
    - 滑动阈值：80px

#### 2.2b 失效商品处理
- **下架商品**：灰色遮罩覆盖商品卡片 + 右上角 "已下架" 标签（背景 #FFE0E0，文字 #EF4444，font-size-xs）
- **勾选框**：下架商品勾选框禁用（不可选中）
- **底部提示**：当存在失效商品时，结算栏上方显示 "X 件商品已失效，点击清理"（font-size-sm, color-text-secondary）
- **清理按钮**：点击清理按钮移除所有失效商品

#### 2.3 底部结算栏
- **位置**：fixed bottom，高度 56px + safe-area-bottom
- **背景**：白色，上边框 var(--color-border-light)
- **左侧**：
  - 全选勾选框 + "全选" 文字（font-size-sm, color-text-primary）
  - "已选 X 件"（font-size-sm, color-text-secondary）
- **右侧**：
  - 合计："合计：" + "¥XX.XX"（font-size-lg, font-weight-bold, color-secondary）
  - "去结算" 按钮：胶囊形，背景 var(--color-primary)，文字 color-text-inverse，font-size-md
    - 未选商品时禁用（背景 var(--color-border)，文字 var(--color-text-tertiary)）
    - 点击：跳转订单确认页，携带已选商品

---

### 3. 订单确认页（pages/order/confirm.vue）

#### 3.1 桌号选择
- **容器**：白色卡片（card 工具类）
- **标签**："桌号"（font-size-md, font-weight-medium, color-text-primary）
- **网格选择**：
  - 默认显示常用桌号网格（A01-A04, B01-B02），3 列布局
  - 每个桌号项：圆角 radius-md，边框 1px solid var(--color-border)，padding: var(--spacing-sm) var(--spacing-md)，文字居中
  - 选中态：边框 2px solid var(--color-primary)，背景 var(--color-primary-light)
  - 最后一个网格项为 "更多"（文字 color-primary），点击展开输入框
  - 展开输入框：placeholder "请输入桌号"，最大长度 10，圆角 radius-md
- **历史桌号**：优先显示最近使用过的桌号（本地存储读取）

#### 3.2 订单备注
- **容器**：白色卡片（card 工具类）
- **标签**："备注"（font-size-md, font-weight-medium, color-text-primary）
- **输入框**：
  - placeholder: "请输入备注信息（如少糖、去冰）"
  - 多行文本，最大长度 200
  - 显示字数统计："0/200"（font-size-xs, color-text-tertiary）

#### 3.3 商品清单
- **容器**：白色卡片（card 工具类）
- **商品项**：
  - 图片：60x60px，圆角 radius-sm
  - 名称：font-size-sm, font-weight-medium, color-text-primary
  - 规格：font-size-xs, color-text-secondary
  - 数量 × 单价：font-size-sm, color-text-secondary
  - 分类标签：饮品/工时费/配件，不同颜色
    - 饮品：背景 #E0F7F5，文字 #4ECDC4
    - 工时费：背景 #FFF7E6，文字 #F59E0B
    - 配件：背景 #E0E7FF，文字 #3B82F6

#### 3.4 会员折扣明细
- **容器**：白色卡片（card 工具类）
- **标题**："会员折扣" + 展开/折叠按钮
- **展开内容**：
  - 饮品折扣：-¥X.XX（font-size-sm, color-secondary）
  - 工时费折扣：-¥X.XX
  - 配件折扣：-¥X.XX
  - 合计折扣：-¥X.XX（font-size-md, font-weight-bold, color-secondary）
- **普通用户（level=0）**：不显示折扣明细，显示 "充值成为会员享专属折扣"

#### 3.5 积分抵扣
- **容器**：白色卡片（card 工具类）
- **开关**：左侧 "使用积分抵扣"，右侧 Switch 开关
  - 未开启：灰色
  - 开启：var(--color-primary)
- **开启后显示**：
  - "可用 XXX 积分，最多抵扣 ¥X.XX（订单金额 30% 上限）"
  - 步进器：减号（最小 0）、积分输入框、加号（最大可用积分）
  - 提示："100 积分=1 元，最低 100 积分起用"
- **积分不足 100 时**：开关禁用，显示 "积分不足 100，无法使用积分抵扣"
- **非会员**：显示 "充值成为会员即可使用积分抵扣"

#### 3.6 金额明细
- **容器**：白色卡片（card 工具类）
- **明细项**：
  - 商品总价：¥X.XX（font-size-sm, color-text-secondary）
  - 会员折扣：-¥X.XX（font-size-sm, color-secondary）
  - 积分抵扣：-¥X.XX（font-size-sm, color-secondary）
  - 实付金额：¥X.XX（font-size-2xl, font-weight-bold, color-secondary）
- **计算公式**：实付 = 商品总价 - 分品类折扣合计 - 积分抵扣

#### 3.7 提交订单
- **位置**：fixed bottom，高度 56px + safe-area-bottom
- **背景**：白色，上边框 var(--color-border-light)
- **左侧**："实付：¥X.XX"（font-size-lg, font-weight-bold, color-secondary）
- **右侧**："提交订单" 按钮
  - 胶囊形，背景 var(--color-primary)，文字 color-text-inverse，font-size-md
  - 未选商品时禁用
  - 点击：显示 "提交中..." loading，调用 order-create Mock API，成功跳转支付页

---

### 4. 订单支付页（pages/order/pay.vue）

#### 4.1 支付金额
- **布局**：页面中央，垂直居中
- **金额**："¥XX.XX"（font-size-4xl, font-weight-bold, color-secondary）
- **订单号**："订单号：202605211430001"（font-size-sm, color-text-secondary）

#### 4.2 支付方式
- **容器**：白色卡片（card 工具类）
- **选项**：微信支付（默认选中）
  - 选中态：边框 2px solid var(--color-primary)，背景 var(--color-primary-light)
  - 未选中态：边框 1px solid var(--color-border)
  - 微信图标 + "微信支付" 文字（font-size-md, color-text-primary）

#### 4.3 确认支付
- **按钮**：全宽，高度 48px，圆角 radius-full
  - 背景 var(--color-primary)，文字 color-text-inverse，font-size-md
  - 点击：显示 "支付中..."，调用 Mock 支付接口

#### 4.4 支付结果
- **支付中**：loading 动画 + "正在确认支付结果..."
- **轮询**：每 2 秒查询一次，最多 30 秒
- **成功**：
  - 绿色对勾图标（48px，color-success）
  - "支付成功"（font-size-xl, font-weight-bold, color-text-primary）
  - 订单信息：订单号、支付金额、支付时间
  - "查看订单" 按钮（主题色）+ "返回首页" 按钮（灰色）
- **失败**：
  - 红色感叹号图标（48px，color-error）
  - "支付失败"（font-size-xl, font-weight-bold, color-text-primary）
  - 失败原因（font-size-sm, color-text-secondary）
  - "重新支付" 按钮 + "取消订单" 按钮

---

### 5. 订单列表页（pages/order/list.vue）

#### 5.1 页面头部
- **标题**："我的订单"（font-size-xl, font-weight-bold, color-text-primary）
- **Tab 栏**：全部/待取餐/已完成/已取消/已取餐
  - 选中：color-primary + 底部 2px 主题色下划线
  - 未选中：color-text-secondary

#### 5.2 订单卡片
- **容器**：白色卡片（card 工具类），margin-bottom: var(--spacing-md)
- **头部**：
  - 左侧：店铺 Logo（40px 圆形）+ 订单号（font-size-sm, color-text-secondary）
  - 右侧：状态标签
    - 待取餐：背景 #FFF7E6，文字 #F59E0B（font-size-xs）
    - 制作中：背景 #E0E7FF，文字 #3B82F6（font-size-xs）
    - 已完成：背景 #E0F7F5，文字 #10B981
    - 已取消：背景 #FFE0E0，文字 #EF4444
- **商品信息**：
  - 商品缩略图（60x60px，圆角 radius-sm）
  - 商品名称（font-size-sm, color-text-primary）
  - 数量（font-size-sm, color-text-secondary）
  - "共 X 件商品"（font-size-sm, color-text-secondary）
- **金额与操作**：
  - 实付金额："¥XX.XX"（font-size-lg, font-weight-bold, color-secondary）
  - 取餐码：大号数字（font-size-3xl, font-weight-bold, color-primary），仅"待取餐"和"制作中"状态显示
  - 取餐码放大：点击取餐码弹出放大弹窗（居中大号取餐码 + "关闭" 按钮），方便远距离扫码
  - 操作按钮：
    - 待取餐："再来一单"（主题色边框）
    - 已完成："评价"（主题色边框）
    - 已取消：无操作按钮

#### 5.2b 取消订单确认弹窗
- **触发**：点击"取消订单"按钮
- **弹窗内容**：
  - 标题："确认取消订单？"（font-size-lg, font-weight-bold）
  - 内容："取消后商品将释放库存"（font-size-sm, color-text-secondary）
  - 按钮："再想想"（灰色，关闭弹窗）+ "确认取消"（红色，执行取消）
- **取消成功**：toast "订单已取消"，刷新订单列表

#### 5.3 空状态
- "暂无订单" 插图 + 文字（color-text-tertiary）

---

### 6. 订单详情页（pages/order/detail.vue）

#### 6.1 状态时间轴
- **布局**：垂直时间轴
- **节点**：待付款 → 已支付 → 制作中 → 已完成
- **当前状态**：高亮（color-primary），节点圆点填充
- **已完成**：对勾图标
- **时间**：每个节点下方显示具体时间（font-size-xs, color-text-secondary）

#### 6.2 商品清单
- 同订单确认页商品清单样式

#### 6.3 金额明细
- 同订单确认页金额明细样式

#### 6.4 订单信息
- 订单号、桌号、备注、创建时间、支付时间
- font-size-sm, color-text-secondary

#### 6.5 操作按钮
- 根据状态显示：
  - 待付款："取消订单"（灰色）+ "去支付"（主题色）
  - 已完成/已取消："再来一单"（主题色）
- "再来一单"：将订单商品加入购物车，toast "已加入购物车"，跳转购物车

---

## ADDED Requirements

### Requirement: 购物车管理
The system SHALL allow users to manage cart items with select, quantity adjust, and delete.

#### Scenario: 左滑删除
- **GIVEN** 用户左滑商品卡片
- **WHEN** 滑动超过 80px
- **THEN** 显示红色删除按钮，点击后移除商品

#### Scenario: 数量调整
- **GIVEN** 用户点击 "+" 按钮
- **WHEN** 数量增加
- **THEN** 合计金额实时更新

### Requirement: 订单创建
The system SHALL create order with table number, remark, discount, and points deduction.

#### Scenario: 提交订单
- **GIVEN** 用户填写桌号和备注
- **WHEN** 点击 "提交订单"
- **THEN** 调用 order-create API，返回支付参数，跳转支付页

### Requirement: 支付流程
The system SHALL handle payment with polling and result display.

#### Scenario: 支付成功
- **GIVEN** 用户确认支付
- **WHEN** 支付成功回调
- **THEN** 显示成功页，发放积分，更新订单状态

## MODIFIED Requirements
无

## REMOVED Requirements
无

## Change Log
- 2026-05-23: 初始版本，基于设计稿 h5_products_fresh_2.jpg 和 h5_orders_fresh_2.jpg 制定
