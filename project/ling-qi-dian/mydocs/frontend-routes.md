# 前端路由设计文档

> 本文档定义三端（点单端、社区端、后台管理）的全部页面路由及 API 调用关系
> 版本: v3.0 | 日期: 2026-06-01

---

## 目录

1. [全局约定](#全局约定)
2. [点单端路由 (packages/app)](#点单端路由)
3. [社区端路由 (packages/app)](#社区端路由)
4. [后台管理端路由 (packages/admin)](#后台管理端路由)
5. [路由-API 映射表](#路由-api-映射表)

---

## 全局约定

### 1. 路由命名规范

- 小写字母 + 连字符
- 语义化命名
- 层级用 `/` 分隔

### 2. 页面文件位置

```
packages/app/src/pages/          # uni-app 页面
packages/admin/src/views/        # 后台管理页面
```

### 3. 路由参数传递

**uni-app (点单/社区)**
```javascript
// 跳转传参
uni.navigateTo({
  url: '/pages/goods/detail?id=123'
})

// 页面接收
onLoad(options) {
  const id = options.id
}
```

**Vue Router (后台)**
```javascript
// 路由定义
{
  path: '/goods/edit/:id',
  component: GoodsEdit
}

// 组件接收
const route = useRoute()
const id = route.params.id
```

---

## 点单端路由

### 路由总览

| 序号 | 路径 | 页面 | 说明 |
|:---:|:---|:---|:---|
| 1 | `/pages/index/index` | 首页 | 商品列表、分类、搜索 |
| 2 | `/pages/cart/cart` | 购物车 | TabBar 页面，商品管理、结算 |
| 3 | `/pages/goods/detail` | 商品详情 | 规格选择、加入购物车 |
| 4 | `/pages/order/confirm` | 订单确认 | 桌号、备注、支付 |
| 5 | `/pages/order/list` | 订单列表 | 历史订单（TabBar 页面） |
| 6 | `/pages/order/detail` | 订单详情 | 订单状态、商品明细 |
| 7 | `/pages/member/index` | 个人中心 | TabBar 页面，等级、积分、余额 |
| 8 | `/pages/member/benefits` | 会员权益 | 分品类折扣、等级对比 |
| 9 | `/pages/member/recharge` | 充值中心 | 充值档位、支付 |
| 10 | `/pages/member/profile` | 用户资料 | 头像、昵称、手机号 |
| 11 | `/pages/member/point-logs` | 积分明细 | 积分流水 |
| 12 | `/pages/member/balance-logs` | 余额明细 | 余额变动流水 |
| 13 | `/pages/member/recharge-logs` | 充值记录 | 充值历史 |
| 14 | `/pages/cashier/index` | 收银台 | 店员收银（二期） |

> **TabBar 配置**：首页 / 订单 / 购物车 / 个人中心（4 项）

### 详细路由定义

#### 1. 首页 - `/pages/index/index`

**页面功能**
- 商品分类展示
- 商品列表
- 搜索功能
- 底部导航栏（TabBar）

**API 调用**
| API | 用途 |
|:---|:---|
| `goods-list` | 加载商品列表 |
| `member-info` | 获取会员信息（显示等级） |

**页面状态**
```typescript
interface IndexState {
  categories: string[]           // 分类列表
  currentCategory: string        // 当前分类
  goodsList: GoodsItem[]         // 商品列表
  cart: CartItem[]               // 购物车
  memberInfo: MemberInfo | null  // 会员信息
}
```

---

#### 2. 商品详情 - `/pages/goods/detail`

**路由参数**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `id` | string | ✅ | 商品ID |

**页面功能**
- 商品图片轮播
- 商品信息展示
- 规格选择（SKU）
- 加入购物车/立即购买

**API 调用**
| API | 用途 |
|:---|:---|
| `goods-detail` | 获取商品详情 |

**页面状态**
```typescript
interface GoodsDetailState {
  goods: GoodsDetail | null      // 商品详情
  selectedSku: Sku | null        // 选中的SKU
  quantity: number               // 购买数量
}
```

---

#### 3. 订单确认 - `/pages/order/confirm`

**路由参数**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `cart` | string | ✅ | 购物车数据（JSON字符串） |

**页面功能**
- 商品清单展示
- 桌号选择
- 备注输入
- 积分抵扣选择
- 支付方式选择
- 提交订单

**API 调用**
| API | 用途 |
|:---|:---|
| `member-info` | 获取会员信息（积分、余额） |
| `order-create` | 创建订单 |

**页面状态**
```typescript
interface OrderConfirmState {
  cartItems: CartItem[]          // 购物车商品
  tableNo: string                // 桌号
  remark: string                 // 备注
  usePoints: number              // 使用积分
  memberInfo: MemberInfo | null  // 会员信息
  discountDetail: {              // 分品类折扣明细
    drinkDiscount: number        // 饮品折扣金额（分）
    laborDiscount: number        // 工时费折扣金额（分）
    partsDiscount: number        // 配件折扣金额（分）
    totalDiscount: number        // 分品类折扣合计（分）
  }
  pointsDeduction: number        // 积分抵扣金额（分）
  finalAmount: number            // 实付金额（分）
}
```

> **说明**：
> - 积分抵扣上限改为订单金额的 **30%**（100积分 = 1元）
> - 实付金额计算公式：`finalAmount = 商品总价 - discountDetail.totalDiscount - pointsDeduction`
> - `discountDetail` 按商品品类分别计算折扣后汇总

---

#### 4. 订单列表 - `/pages/order/list`

**路由参数**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `status` | string | ❌ | 订单状态筛选 |

**页面功能**
- 订单状态筛选（全部/待支付/制作中/已完成）
- 订单列表
- 下拉刷新
- 上拉加载更多

**API 调用**
| API | 用途 |
|:---|:---|
| `order-list` | 获取订单列表 |

**页面状态**
```typescript
interface OrderListState {
  status: string                 // 当前筛选状态
  orders: OrderItem[]            // 订单列表
  page: number                   // 当前页码
  hasMore: boolean               // 是否还有更多
}
```

---

#### 5. 订单详情 - `/pages/order/detail`

**路由参数**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `order_no` | string | ✅ | 订单号 |

**页面功能**
- 订单状态展示
- 商品明细
- 金额明细
- 支付信息

**API 调用**
| API | 用途 |
|:---|:---|
| `order-detail` | 获取订单详情 |

---

#### 6. 会员中心 - `/pages/member/index`

**页面功能**
- 会员等级卡片（等级永久保留，无降级，无续期）
- 积分余额展示
- 功能入口（充值、积分、记录）
- 会员权益说明

**API 调用**
| API | 用途 |
|:---|:---|
| `member-info` | 获取会员信息 |
| `member-benefits` | 获取会员权益 |

**页面状态**
```typescript
interface MemberIndexState {
  memberInfo: MemberInfo | null
  benefits: MemberBenefits | null
  totalRecharge: number          // 累计充值金额（单位：分）
  level: number                  // 等级值（0-6，0为普通用户）
  levelName: string              // 等级名称
  currentRecharge: number        // 当前累计充值金额（分）
  nextLevelThreshold: number     // 下一等级门槛（分，level=6时为0）
}
```

> **说明**：
> - 升级进度条显示为 `currentRecharge / nextLevelThreshold`
> - 等级范围 0-6：0=普通用户, 1=青铜, 2=白银, 3=黄金, 4=铂金, 5=钻石, 6=至尊
> - `level_name` 枚举：普通用户 / 青铜骑士 / 白银骑士 / 黄金骑士 / 铂金骑士 / 钻石骑士 / 至尊骑士

---

#### 7. 充值中心 - `/pages/member/recharge`

**页面功能**
- 充值档位列表（平时5档 / 开业活动4档）
- 当前等级提示
- 活动横幅与倒计时（活动状态）
- 充值支付

**API 调用**
| API | 用途 |
|:---|:---|
| `member-recharge-tiers` | 获取充值档位（带 `is_opening_activity` 参数）|
| `member-recharge` | 发起充值 |

**页面状态**
```typescript
interface RechargeState {
  tiers: RechargeTier[]          // 充值档位（平时：tier_id 1-5；活动：tier_id 11-14）
  selectedTier: RechargeTier | null  // 选中的档位
  memberInfo: MemberInfo | null  // 会员信息
  isOpeningActivity: boolean     // 是否处于开业活动期间
  activityEndTime: string | null  // 活动结束时间（ISO 8601，用于倒计时）
}
```

> **说明**：
> - 平时状态展示 5 档卡片（tier_id 1-5：¥198 / ¥680 / ¥1,000 / ¥3,000 / ¥8,000）
> - 活动状态展示 4 档卡片（tier_id 11-14：¥680 / ¥1,000 / ¥3,000 / ¥8,000）+ 活动横幅 + 倒计时
> - `member-recharge-tiers` 请求需携带 `is_opening_activity` 参数以区分活动档位

---

#### 8. 会员权益 - `/pages/member/benefits`

**页面功能**
- 当前等级权益展示（分品类折扣明细）
- 6级等级对比表（level 0-6，普通用户→至尊）
- 升级提示
- 权益说明：等级永久保留，无降级，无续期

**API 调用**
| API | 用途 |
|:---|:---|
| `member-benefits` | 获取当前等级及所有等级权益配置 |

**页面状态**
```typescript
interface MemberBenefitsState {
  currentLevel: number           // 当前等级（0-6）
  levelName: string              // 当前等级名称
  drinkDiscount: number          // 饮品折扣率（如 0.98=9.8折，1.0=无折扣）
  laborDiscount: number          // 工时费折扣率
  partsDiscount: number          // 配件折扣率
  pointsMultiplier: number       // 积分倍率
  carWashCount: number           // 每月洗车次数
  maintenanceDiscount: number    // 保养折扣率
  rescueKm: number               // 免费救援公里数
  spareCarDays: number           // 备用车服务天数/年
  hasExclusiveService: boolean   // 是否有专属客服
  birthdayCouponCount: number    // 生日礼饮品券数量
  allLevels: LevelBenefit[]      // 所有等级权益对比表（6行：0-6）
  nextLevelThreshold: number     // 下一等级门槛（分）
}
```

> **说明**：
> - 移除任何"续期"相关状态（等级永久保留）
> - 分品类折扣状态：`drinkDiscount` / `laborDiscount` / `partsDiscount`
> - 等级对比表从 7 行改为 6 行（level 0-6）

---

#### 9. 积分明细 - `/pages/member/points`

**页面功能**
- 积分余额展示
- 积分流水列表
- 筛选（全部/获得/使用）

**API 调用**
| API | 用途 |
|:---|:---|
| `member-point-logs` | 获取积分流水 |

---

#### 10. 充值记录 - `/pages/member/records`

**页面功能**
- 充值历史列表
- 充值状态展示

**API 调用**
| API | 用途 |
|:---|:---|
| `member-recharge-logs` | 获取充值记录 |

---

## 社区端路由

### 路由总览

| 序号 | 路径 | 页面 | 说明 |
|:---:|:---|:---|:---|
| 1 | `/pages/community/index` | 社区首页 | 帖子信息流 |
| 2 | `/pages/community/post` | 发布帖子 | 图文发布 |
| 3 | `/pages/community/detail` | 帖子详情 | 内容、评论、点赞 |
| 4 | `/pages/community/my` | 我的帖子 | 个人发布历史 |

### 详细路由定义

#### 1. 社区首页 - `/pages/community/index`

**页面功能**
- 帖子信息流（瀑布流/列表）
- 发布按钮
- 下拉刷新
- 上拉加载

**API 调用**
| API | 用途 |
|:---|:---|
| `community-post-list` | 获取帖子列表 |

**页面状态**
```typescript
interface CommunityIndexState {
  posts: PostItem[]              // 帖子列表
  page: number                   // 当前页码
  hasMore: boolean               // 是否还有更多
}
```

---

#### 2. 发布帖子 - `/pages/community/post`

**页面功能**
- 图片上传（最多9张）
- 文字内容输入
- 路线信息（可选）
- 发布按钮

**API 调用**
| API | 用途 |
|:---|:---|
| `community-post-create` | 创建帖子 |

**页面状态**
```typescript
interface PostCreateState {
  content: string                // 内容
  images: string[]               // 图片列表
  routeInfo: RouteInfo | null    // 路线信息
}
```

---

#### 3. 帖子详情 - `/pages/community/detail`

**路由参数**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `post_id` | string | ✅ | 帖子ID |

**页面功能**
- 帖子内容展示
- 图片浏览
- 路线地图展示
- 点赞/取消点赞
- 评论列表
- 发表评论

**API 调用**
| API | 用途 |
|:---|:---|
| `community-post-detail` | 获取帖子详情 |
| `community-comment-list` | 获取评论列表 |
| `community-post-like` | 点赞/取消点赞 |
| `community-comment-create` | 发表评论 |
| `community-post-delete` | 删除帖子（作者） |

---

#### 4. 我的帖子 - `/pages/community/my`

**页面功能**
- 个人发布的帖子列表
- 删除帖子

**API 调用**
| API | 用途 |
|:---|:---|
| `community-post-list` | 获取帖子列表（带 author_id 参数） |

---

## 后台管理端路由

### 路由总览

| 序号 | 路径 | 页面 | 说明 |
|:---:|:---|:---|:---|
| 1 | `/login` | 登录页 | 管理员登录 |
| 2 | `/` | 概览页 | 数据统计、快捷入口 |
| 3 | `/goods` | 商品管理 | 商品列表、增删改查 |
| 4 | `/goods/edit/:id` | 商品编辑 | 新增/编辑商品 |
| 5 | `/orders` | 订单管理 | 订单列表、状态管理 |
| 6 | `/orders/:order_no` | 订单详情 | 订单详情查看 |
| 7 | `/members` | 会员管理 | 会员列表、详情 |
| 8 | `/members/:uid` | 会员详情 | 会员详情、积分调整 |
| 9 | `/community` | 社区管理 | 帖子审核、删除 |

### 详细路由定义

#### 1. 登录页 - `/login`

**页面功能**
- 用户名密码输入
- 登录按钮
- 登录状态保持

**API 调用**
| API | 用途 |
|:---|:---|
| `admin-login` | 管理员登录 |

---

#### 2. 概览页 - `/`

**页面功能**
- 今日数据统计
- 快捷功能入口
- 图表展示

**API 调用**
| API | 用途 |
|:---|:---|
| `admin-orders-list` | 今日订单统计 |
| `admin-members-list` | 会员统计 |

---

#### 3. 商品管理 - `/goods`

**页面功能**
- 商品列表表格
- 分类筛选
- 状态筛选
- 搜索
- 新增/编辑/删除

**API 调用**
| API | 用途 |
|:---|:---|
| `admin-goods-list` | 获取商品列表 |
| `admin-goods-save` | 保存商品 |

---

#### 4. 商品编辑 - `/goods/edit/:id`

**路由参数**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `id` | string | ❌ | 商品ID（新增时为空） |

**页面功能**
- 商品信息表单
- SKU 规格管理
- 图片上传
- 保存/取消

**API 调用**
| API | 用途 |
|:---|:---|
| `goods-detail` | 获取商品详情（编辑时） |
| `admin-goods-save` | 保存商品 |

---

#### 5. 订单管理 - `/orders`

**页面功能**
- 订单列表表格
- 状态筛选
- 时间筛选
- 订单号搜索
- 状态更新

**API 调用**
| API | 用途 |
|:---|:---|
| `admin-orders-list` | 获取订单列表 |
| `admin-order-update` | 更新订单状态 |

---

#### 6. 订单详情 - `/orders/:order_no`

**路由参数**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `order_no` | string | ✅ | 订单号 |

**页面功能**
- 订单详情展示
- 商品明细
- 支付信息
- 状态变更

**API 调用**
| API | 用途 |
|:---|:---|
| `order-detail` | 获取订单详情 |
| `admin-order-update` | 更新订单状态 |

---

#### 7. 会员管理 - `/members`

**页面功能**
- 会员列表表格
- 等级筛选
- 搜索
- 查看详情

**API 调用**
| API | 用途 |
|:---|:---|
| `admin-members-list` | 获取会员列表 |

---

#### 8. 会员详情 - `/members/:uid`

**路由参数**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `uid` | string | ✅ | 用户ID |

**页面功能**
- 会员基本信息
- 积分余额
- 消费统计
- 积分调整
- 最近订单
- 最近积分变动

**API 调用**
| API | 用途 |
|:---|:---|
| `admin-members-detail` | 获取会员详情 |
| `admin-point-adjust` | 调整积分 |
| `order-list` | 最近订单 |
| `member-point-logs` | 最近积分变动 |

---

#### 9. 社区管理 - `/community`

**页面功能**
- 帖子列表
- 内容预览
- 删除帖子
- 状态筛选

**API 调用**
| API | 用途 |
|:---|:---|
| `admin-community-posts` | 获取帖子列表 |
| `admin-post-delete` | 删除帖子 |

---

## 路由-API 映射表

### 点单端

| 页面路径 | API 调用 |
|:---|:---|
| `/pages/index/index` | `goods-list`, `member-info` |
| `/pages/goods/detail` | `goods-detail` |
| `/pages/order/confirm` | `member-info`, `order-create` |
| `/pages/order/list` | `order-list` |
| `/pages/order/detail` | `order-detail` |
| `/pages/member/index` | `member-info`, `member-benefits` |
| `/pages/member/benefits` | `member-benefits` |
| `/pages/member/recharge` | `member-recharge-tiers` (带 `is_opening_activity` 参数), `member-recharge` |
| `/pages/member/points` | `member-point-logs` |
| `/pages/member/records` | `member-recharge-logs` |

### 社区端

| 页面路径 | API 调用 |
|:---|:---|
| `/pages/community/index` | `community-post-list` |
| `/pages/community/post` | `community-post-create` |
| `/pages/community/detail` | `community-post-detail`, `community-comment-list`, `community-post-like`, `community-comment-create`, `community-post-delete` |
| `/pages/community/my` | `community-post-list` |

### 后台管理端

| 页面路径 | API 调用 |
|:---|:---|
| `/login` | `admin-login` |
| `/` | `admin-orders-list`, `admin-members-list` |
| `/goods` | `admin-goods-list`, `admin-goods-save` |
| `/goods/edit/:id` | `goods-detail`, `admin-goods-save` |
| `/orders` | `admin-orders-list`, `admin-order-update` |
| `/orders/:order_no` | `order-detail`, `admin-order-update` |
| `/members` | `admin-members-list` |
| `/members/:uid` | `admin-members-detail`, `admin-point-adjust`, `order-list`, `member-point-logs` |
| `/community` | `admin-community-posts`, `admin-post-delete` |

---

*文档结束*
