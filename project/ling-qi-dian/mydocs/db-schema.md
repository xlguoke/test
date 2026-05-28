# 数据库 Schema 设计文档

> 本文档定义机车俱乐部饮品与社区系统的全部 MongoDB 集合结构
> 版本: v2.1 | 日期: 2026-05-24
>
> **产品基准**：`full-feature-list.md` v3.0 | 集合覆盖：14 个 MongoDB 集合

---

## 目录

1. [集合概览](#集合概览)
2. [会员相关集合](#会员相关集合)
3. [商品订单相关集合](#商品订单相关集合)
4. [社区相关集合](#社区相关集合)
5. [后台管理相关集合](#后台管理相关集合)
6. [集合关系图](#集合关系图)

---

## 集合概览

| 集合名 | 用途 | 预估数据量 | 核心操作 |
|:---|:---|:---|:---|
| `members` | 会员主表 | 1万+ | CRUD |
| `member_levels` | 会员等级配置 | 7 | 查询 |
| `point_logs` | 积分流水 | 10万+ | 插入、查询 |
| `balance_logs` | 余额变动流水 | 5万+ | 插入、查询 |
| `recharge_logs` | 充值记录 | 5万+ | 插入、查询 |
| `activities` | 开业活动配置 | 1~5 | CRUD |
| `goods` | 商品信息 | 100+ | CRUD |
| `orders` | 订单主表 | 10万+ | CRUD |
| `community_posts` | 社区帖子 | 1万+ | CRUD |
| `community_comments` | 评论 | 5万+ | 插入、查询、删除 |
| `community_likes` | 点赞记录 | 10万+ | 插入、删除 |
| `admin_users` | 后台账号 | 10+ | CRUD |
| `admin_operation_logs` | 后台操作日志 | 1万+ | 插入、查询 |
| `tables` | 桌号管理 | 50+ | CRUD |

---

## 会员相关集合

### 1. member_levels（会员等级配置表）

存储会员等级定义与权益配置，初始化7条数据，运营后台可调整。

```json
{
  "_id": "ObjectId",
  "level": 0,
  "level_name": "普通用户",
  "recharge_threshold": 0,
  "points_multiplier": 1.0,
  "drink_discount": 1.0,
  "labor_discount": 1.0,
  "parts_discount": 1.0,
  "car_wash_count": 0,
  "maintenance_discount": 1.0,
  "rescue_km": 0,
  "spare_car_days": 0,
  "has_exclusive_service": false,
  "birthday_coupon_count": 0,
  "update_time": "2026-05-21T00:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `level` | Number | ✅ | - | 等级值（0-6） |
| `level_name` | String | ✅ | - | 等级名称 |
| `recharge_threshold` | Number | ✅ | 0 | 累计充值门槛（单位：分） |
| `points_multiplier` | Number | ✅ | 1.0 | 积分倍率 |
| `drink_discount` | Number | ✅ | 1.0 | 饮品折扣率（1.0=无折扣，0.98=9.8折） |
| `labor_discount` | Number | ✅ | 1.0 | 工时费折扣率 |
| `parts_discount` | Number | ✅ | 1.0 | 配件折扣率 |
| `car_wash_count` | Number | ✅ | 0 | 每月洗车次数（0=无） |
| `maintenance_discount` | Number | ✅ | 1.0 | 保养折扣率 |
| `rescue_km` | Number | ✅ | 0 | 免费救援公里数 |
| `spare_car_days` | Number | ✅ | 0 | 备用车服务天数/年 |
| `has_exclusive_service` | Boolean | ✅ | false | 是否有专属客服 |
| `birthday_coupon_count` | Number | ✅ | 0 | 生日礼饮品券数量 |
| `update_time` | Date | ✅ | now | 更新时间 |

**初始数据**

```javascript
db.member_levels.insertMany([
  { level: 0, level_name: "普通用户", recharge_threshold: 0,     points_multiplier: 1.0, drink_discount: 1.0,  labor_discount: 1.0,  parts_discount: 1.0,  car_wash_count: 0, maintenance_discount: 1.0,  rescue_km: 0,   spare_car_days: 0, has_exclusive_service: false, birthday_coupon_count: 0,  update_time: new Date("2026-05-21T00:00:00Z") },
  { level: 1, level_name: "青铜",     recharge_threshold: 100000, points_multiplier: 1.1, drink_discount: 0.98, labor_discount: 0.95, parts_discount: 1.0,  car_wash_count: 0, maintenance_discount: 0.95, rescue_km: 0,   spare_car_days: 0, has_exclusive_service: false, birthday_coupon_count: 1,  update_time: new Date("2026-05-21T00:00:00Z") },
  { level: 2, level_name: "白银",     recharge_threshold: 300000, points_multiplier: 1.2, drink_discount: 0.95, labor_discount: 0.90, parts_discount: 1.0,  car_wash_count: 1, maintenance_discount: 0.90, rescue_km: 0,   spare_car_days: 0, has_exclusive_service: false, birthday_coupon_count: 2,  update_time: new Date("2026-05-21T00:00:00Z") },
  { level: 3, level_name: "黄金",     recharge_threshold: 800000, points_multiplier: 1.3, drink_discount: 0.90, labor_discount: 0.85, parts_discount: 0.98, car_wash_count: 2, maintenance_discount: 0.85, rescue_km: 50,  spare_car_days: 0, has_exclusive_service: false, birthday_coupon_count: 3,  update_time: new Date("2026-05-21T00:00:00Z") },
  { level: 4, level_name: "铂金",     recharge_threshold: 1500000, points_multiplier: 1.5, drink_discount: 0.85, labor_discount: 0.80, parts_discount: 0.95, car_wash_count: 3, maintenance_discount: 0.80, rescue_km: 80,  spare_car_days: 0, has_exclusive_service: true,  birthday_coupon_count: 5,  update_time: new Date("2026-05-21T00:00:00Z") },
  { level: 5, level_name: "钻石",     recharge_threshold: 3000000, points_multiplier: 1.8, drink_discount: 0.80, labor_discount: 0.75, parts_discount: 0.90, car_wash_count: 4, maintenance_discount: 0.80, rescue_km: 100, spare_car_days: 3, has_exclusive_service: true,  birthday_coupon_count: 5,  update_time: new Date("2026-05-21T00:00:00Z") },
  { level: 6, level_name: "至尊",     recharge_threshold: 5000000, points_multiplier: 2.0, drink_discount: 0.80, labor_discount: 0.70, parts_discount: 0.90, car_wash_count: -1, maintenance_discount: 0.80, rescue_km: 200, spare_car_days: 7, has_exclusive_service: true,  birthday_coupon_count: 10, update_time: new Date("2026-05-21T00:00:00Z") }
])
```

> 注：`car_wash_count: -1` 表示至尊会员无限次洗车。

**索引**

```javascript
// 等级查询
db.member_levels.createIndex({ level: 1 })
```

---

### 2. members（会员主表）

存储会员核心信息，与 uni-id 用户表一对一关联。

```json
{
  "_id": "uni-id 的 uid",
  "nickname": "微信昵称",
  "avatar": "头像URL",
  "mobile": "13800138000",
  
  "level": 1,
  "level_name": "青铜",
  "total_recharge": 100000,
  "growth_value": 100000,
  
  "points": 1250,
  "total_points_earned": 5000,
  "total_points_used": 2250,
  "total_points_expired": 0,
  
  "balance": 11000,
  "total_consume": 80000,
  
  "create_time": "2026-01-01T00:00:00Z",
  "update_time": "2026-05-21T10:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | String | ✅ | - | 主键，与 uni-id uid 一致 |
| `nickname` | String | ✅ | - | 微信昵称 |
| `avatar` | String | ❌ | "" | 头像URL |
| `mobile` | String | ❌ | "" | 手机号 |
| `level` | Number | ✅ | 0 | 等级值（0-6） |
| `level_name` | String | ✅ | "普通用户" | 等级名称 |
| `total_recharge` | Number | ✅ | 0 | 累计充值金额（单位：分） |
| `growth_value` | Number | ✅ | 0 | 累计成长值（单位：分），用于等级计算（1:1:1模型） |
| `points` | Number | ✅ | 0 | 当前可用积分 |
| `total_points_earned` | Number | ✅ | 0 | 累计获得积分 |
| `total_points_used` | Number | ✅ | 0 | 累计使用积分 |
| `total_points_expired` | Number | ✅ | 0 | 累计过期积分 |
| `balance` | Number | ✅ | 0 | 储值余额（单位：分） |
| `total_consume` | Number | ✅ | 0 | 累计消费金额（单位：分） |
| `create_time` | Date | ✅ | now | 创建时间 |
| `update_time` | Date | ✅ | now | 更新时间 |

**索引**

```javascript
// 等级查询
db.members.createIndex({ level: 1 })

// 充值排行
db.members.createIndex({ total_recharge: 1 })

// 消费排行
db.members.createIndex({ total_consume: -1 })
```

---

### 2. point_logs（积分流水）

记录积分变动明细，不可修改，只追加。

```json
{
  "_id": "ObjectId",
  "member_id": "用户ID",
  "change": 150,
  "after_points": 1250,
  "reason": "消费奖励",
  "reason_code": "consume",
  "order_id": "订单ID",
  "expire_time": "2027-05-21T00:00:00Z",
  "create_time": "2026-05-21T10:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `member_id` | String | ✅ | - | 会员ID |
| `change` | Number | ✅ | - | 变动值（正数增加，负数减少） |
| `after_points` | Number | ✅ | - | 变动后积分余额 |
| `reason` | String | ✅ | - | 变动原因描述 |
| `reason_code` | String | ✅ | - | 变动原因代码 |
| `order_id` | String | ❌ | "" | 关联订单ID |
| `expire_time` | Date | ❌ | null | 积分过期时间（ISO 8601） |
| `create_time` | Date | ✅ | now | 创建时间 |

**reason_code 枚举**

| 代码 | 说明 |
|:---|:---|
| `recharge` | 充值赠送 |
| `consume` | 消费奖励 |
| `check_in` | 签到奖励 |
| `share` | 分享奖励 |
| `task` | 任务奖励 |
| `exchange` | 积分兑换 |
| `lottery` | 积分抽奖 |
| `expire` | 积分过期 |
| `deduct` | 订单抵扣 |
| `manual_adjust` | 人工调整 |

**索引**

```javascript
// 用户积分流水查询
db.point_logs.createIndex({ member_id: 1, create_time: -1 })

// 过期积分查询（定时任务用）
db.point_logs.createIndex({ expire_time: 1 })

// 关联订单查询
db.point_logs.createIndex({ order_id: 1 })
```

---

### 2.5. balance_logs（余额变动流水）

记录会员余额变动明细，不可修改，只追加。

> **对应功能**：H5-BALANCE-002~003

```json
{
  "_id": "ObjectId",
  "member_id": "用户ID",
  "change": 5000,
  "after_balance": 11000,
  "reason": "充值",
  "type": "recharge",
  "order_no": "R202605210001",
  "create_time": "2026-05-21T10:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `member_id` | String | ✅ | - | 会员ID |
| `change` | Number | ✅ | - | 变动金额（正数增加，负数减少，单位：分） |
| `after_balance` | Number | ✅ | - | 变动后余额（单位：分） |
| `reason` | String | ✅ | - | 变动原因描述 |
| `type` | String | ✅ | - | 变动类型：recharge（充值）/ consume（消费）/ refund（退款）/ adjust（调整） |
| `order_no` | String | ❌ | "" | 关联订单号 |
| `create_time` | Date | ✅ | now | 创建时间 |

**索引**

```javascript
// 用户余额流水查询
db.balance_logs.createIndex({ member_id: 1, create_time: -1 })

// 类型筛选
db.balance_logs.createIndex({ member_id: 1, type: 1 })

// 关联订单查询
db.balance_logs.createIndex({ order_no: 1 })
```

---

### 3. recharge_logs（充值记录）

记录会员充值历史。

```json
{
  "_id": "ObjectId",
  "member_id": "用户ID",
  "recharge_amount": 298000,
  "bonus_points": 2980,
  "growth_value": 2980,
  "tier_id": 3,
  "order_no": "R202605210001",
  "pay_status": 1,
  "pay_time": "2026-05-21T10:00:00Z",
  "create_time": "2026-05-21T09:50:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `member_id` | String | ✅ | - | 会员ID |
| `recharge_amount` | Number | ✅ | - | 充值金额（单位：分） |
| `bonus_points` | Number | ✅ | 0 | 赠送积分（= 充值金额元，1:1:1模型） |
| `growth_value` | Number | ✅ | 0 | 成长值（= 充值金额元，1:1:1模型） |
| `tier_id` | Number | ✅ | - | 充值档位ID |
| `order_no` | String | ✅ | - | 充值订单号 |
| `pay_status` | Number | ✅ | 0 | 支付状态：0待支付/1已支付/2已取消 |
| `pay_time` | Date | ❌ | null | 支付时间 |
| `create_time` | Date | ✅ | now | 创建时间 |

**索引**

```javascript
// 用户充值记录查询
db.recharge_logs.createIndex({ member_id: 1, create_time: -1 })

// 订单号唯一
db.recharge_logs.createIndex({ order_no: 1 }, { unique: true })

// 支付状态查询
db.recharge_logs.createIndex({ pay_status: 1 })
```

---

## 商品订单相关集合

### 4. goods（商品表）

存储商品信息，支持多规格（SKU）。

```json
{
  "_id": "ObjectId",
  "name": "美式咖啡",
  "category": "咖啡",
  "description": "精选阿拉比卡咖啡豆",
  "images": ["url1", "url2"],
  "status": 1,
  "sort_order": 1,
  "sku_list": [
    {
      "sku_id": "sku_001",
      "name": "大杯/去冰",
      "price": 2500,
      "stock": 50,
      "specs": {
        "size": "大杯",
        "temperature": "去冰"
      }
    }
  ],
  "create_time": "2026-01-01T00:00:00Z",
  "update_time": "2026-05-21T10:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `name` | String | ✅ | - | 商品名称 |
| `category` | String | ✅ | - | 分类 |
| `description` | String | ❌ | "" | 商品描述 |
| `images` | Array<String> | ❌ | [] | 商品图片URL列表 |
| `status` | Number | ✅ | 1 | 状态：1上架/0下架/-1删除 |
| `sort_order` | Number | ✅ | 0 | 排序权重 |
| `sku_list` | Array<Object> | ✅ | [] | SKU列表 |
| `create_time` | Date | ✅ | now | 创建时间 |
| `update_time` | Date | ✅ | now | 更新时间 |

**SKU 结构**

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `sku_id` | String | SKU唯一标识 |
| `name` | String | SKU名称（如"大杯/去冰"） |
| `price` | Number | 价格（单位：分） |
| `stock` | Number | 库存（-1表示无限） |
| `specs` | Object | 规格键值对 |

**索引**

```javascript
// 分类+状态查询
db.goods.createIndex({ category: 1, status: 1 })

// 排序
db.goods.createIndex({ sort_order: -1 })

// 状态查询
db.goods.createIndex({ status: 1 })
```

---

### 5. orders（订单表）

存储订单完整信息。

```json
{
  "_id": "ObjectId",
  "order_no": "202605211430001",
  "member_id": "用户ID",
  "table_no": "A01",
  "source": "customer",
  "cashier_id": "",
  
  "goods": [
    {
      "goods_id": "商品ID",
      "goods_name": "美式咖啡",
      "sku_id": "sku_001",
      "sku_name": "大杯/去冰",
      "price": 2500,
      "quantity": 2,
      "subtotal": 5000
    }
  ],
  
  "original_amount": 5000,
  "discount_amount": 0,
  "discount_detail": {
    "drink_discount_amount": 100,
    "labor_discount_amount": 0,
    "parts_discount_amount": 0,
    "total_discount_amount": 100
  },
  "point_deduct": 0,
  "pay_amount": 5000,
  
  "pay_way": "wechat",
  "pay_status": 1,
  "pay_time": "2026-05-21T14:35:00Z",
  
  "order_status": "completed",
  "remark": "少糖",

  "refund_amount": 0,
  "refund_status": "",
  "refund_reason": "",
  "refund_remark": "",
  "refund_time": null,
  
  "create_time": "2026-05-21T14:30:00Z",
  "update_time": "2026-05-21T14:35:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `order_no` | String | ✅ | - | 订单号（唯一） |
| `member_id` | String | ✅ | - | 会员ID |
| `table_no` | String | ❌ | "" | 桌号 |
| `source` | String | ✅ | - | 来源：customer/cashier |
| `cashier_id` | String | ❌ | "" | 店员ID（source=cashier时） |
| `goods` | Array<Object> | ✅ | - | 商品列表 |
| `original_amount` | Number | ✅ | - | 原始金额（分） |
| `discount_amount` | Number | ✅ | 0 | 优惠金额（分） |
| `discount_detail` | Object | ✅ | `{}` | 分品类折扣明细 |
| `point_deduct` | Number | ✅ | 0 | 积分抵扣金额（分） |
| `pay_amount` | Number | ✅ | - | 实付金额（分） |
| `pay_way` | String | ✅ | - | 支付方式：wechat/balance/cash |
| `pay_status` | Number | ✅ | 0 | 支付状态：0待支付/1已支付/2已取消 |
| `pay_time` | Date | ❌ | null | 支付时间 |
| `order_status` | String | ✅ | "pending" | 订单状态 |
| `remark` | String | ❌ | "" | 备注 |
| `refund_amount` | Number | ✅ | 0 | 退款金额（分），0=未退款 |
| `refund_status` | String | ✅ | "" | 退款状态：pending（待处理）/ approved（已退款）/ rejected（已驳回），空=未申请 |
| `refund_reason` | String | ✅ | "" | 退款原因：customer_cancel（顾客取消）/ goods_issue（商品问题）/ other（其他） |
| `refund_remark` | String | ✅ | "" | 退款备注 |
| `refund_time` | Date | ❌ | null | 退款完成时间 |
| `create_time` | Date | ✅ | now | 创建时间 |
| `update_time` | Date | ✅ | now | 更新时间 |

**discount_detail 结构**

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `drink_discount_amount` | Number | 饮品折扣金额（分） |
| `labor_discount_amount` | Number | 工时费折扣金额（分） |
| `parts_discount_amount` | Number | 配件折扣金额（分） |
| `total_discount_amount` | Number | 折扣合计金额（分） |

**order_status 枚举**

| 状态 | 说明 |
|:---|:---|
| `pending` | 待支付 |
| `paid` | 已支付/待制作 |
| `making` | 制作中 |
| `completed` | 已完成 |
| `cancelled` | 已取消 |
| `refunded` | 已退款 |

**索引**

```javascript
// 订单号唯一
db.orders.createIndex({ order_no: 1 }, { unique: true })

// 用户订单查询
db.orders.createIndex({ member_id: 1, create_time: -1 })

// 状态查询
db.orders.createIndex({ order_status: 1 })

// 支付状态查询
db.orders.createIndex({ pay_status: 1 })
```

---

## 社区相关集合

### 6. community_posts（社区帖子）

存储用户发布的帖子内容。

```json
{
  "_id": "ObjectId",
  "author_id": "用户ID",
  "content": "今天骑行了铁山坪，风景真不错！",
  "images": ["url1", "url2", "url3"],
  
  "route_info": {
    "start": "铁山坪",
    "end": "南山",
    "distance": 50,
    "duration": 120,
    "path": [[106.5, 29.6], [106.6, 29.7]]
  },
  
  "likes": 15,
  "comments_count": 8,
  
  "status": 1,
  "is_top": false,
  
  "create_time": "2026-05-21T10:00:00Z",
  "update_time": "2026-05-21T10:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `author_id` | String | ✅ | - | 作者ID |
| `content` | String | ✅ | - | 帖子内容 |
| `images` | Array<String> | ❌ | [] | 图片URL列表 |
| `route_info` | Object | ❌ | null | 路线信息 |
| `likes` | Number | ✅ | 0 | 点赞数 |
| `comments_count` | Number | ✅ | 0 | 评论数 |
| `status` | Number | ✅ | 1 | 状态：1正常/0隐藏/-1删除 |
| `is_top` | Boolean | ✅ | false | 是否置顶 |
| `create_time` | Date | ✅ | now | 创建时间 |
| `update_time` | Date | ✅ | now | 更新时间 |

**route_info 结构**

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `start` | String | 起点 |
| `end` | String | 终点 |
| `distance` | Number | 距离（公里） |
| `duration` | Number | 预计用时（分钟） |
| `path` | Array | 路线坐标点数组 |

**索引**

```javascript
// 时间倒序查询（信息流）
db.community_posts.createIndex({ create_time: -1 })

// 作者帖子查询
db.community_posts.createIndex({ author_id: 1, create_time: -1 })

// 置顶+时间查询
db.community_posts.createIndex({ is_top: -1, create_time: -1 })

// 状态查询
db.community_posts.createIndex({ status: 1 })
```

---

### 7. community_comments（评论表）

存储帖子评论。

```json
{
  "_id": "ObjectId",
  "post_id": "帖子ID",
  "author_id": "用户ID",
  "content": "风景确实不错！",
  "reply_to": "",
  "status": 1,
  "create_time": "2026-05-21T11:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `post_id` | String | ✅ | - | 帖子ID |
| `author_id` | String | ✅ | - | 作者ID |
| `content` | String | ✅ | - | 评论内容 |
| `reply_to` | String | ❌ | "" | 回复给某用户ID |
| `status` | Number | ✅ | 1 | 状态：1正常/0隐藏/-1删除 |
| `create_time` | Date | ✅ | now | 创建时间 |

**索引**

```javascript
// 帖子评论查询
db.community_comments.createIndex({ post_id: 1, create_time: 1 })

// 作者评论查询
db.community_comments.createIndex({ author_id: 1, create_time: -1 })
```

---

### 8. community_likes（点赞表）

存储点赞记录，用于点赞/取消点赞。

```json
{
  "_id": "ObjectId",
  "post_id": "帖子ID",
  "user_id": "用户ID",
  "create_time": "2026-05-21T10:30:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `post_id` | String | ✅ | - | 帖子ID |
| `user_id` | String | ✅ | - | 用户ID |
| `create_time` | Date | ✅ | now | 创建时间 |

**索引**

```javascript
// 用户点赞查询
db.community_likes.createIndex({ user_id: 1, create_time: -1 })

// 帖子点赞查询
db.community_likes.createIndex({ post_id: 1 })

// 唯一索引：防止重复点赞
db.community_likes.createIndex({ post_id: 1, user_id: 1 }, { unique: true })
```

---

## 后台管理相关集合

### 9. activities（开业活动配置表）

存储限时开业活动配置，支持多档位活动规则。

```json
{
  "_id": "ObjectId",
  "activity_code": "OPENING_2026",
  "activity_name": "开业活动",
  "start_time": "2026-06-01T00:00:00Z",
  "end_time": "2026-06-30T23:59:59Z",
  "status": 1,
  "tier_configs": [
    {
      "tier_id": 11,
      "amount": 68000,
      "bonus_balance": 6800,
      "bonus_points": 748,
      "extra_bonus_points": 100,
      "reach_level": 1
    }
  ],
  "create_time": "2026-05-21T00:00:00Z",
  "update_time": "2026-05-21T00:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `activity_code` | String | ✅ | - | 活动唯一代码 |
| `activity_name` | String | ✅ | - | 活动名称 |
| `start_time` | Date | ✅ | - | 活动开始时间 |
| `end_time` | Date | ✅ | - | 活动结束时间 |
| `status` | Number | ✅ | 1 | 状态：1启用/0禁用 |
| `tier_configs` | Array<Object> | ✅ | [] | 活动档位配置列表 |
| `create_time` | Date | ✅ | now | 创建时间 |
| `update_time` | Date | ✅ | now | 更新时间 |

**tier_configs 结构**

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `tier_id` | Number | 活动档位ID |
| `amount` | Number | 充值金额（单位：分） |
| `bonus_balance` | Number | 赠送余额（单位：分） |
| `bonus_points` | Number | 赠送积分 |
| `extra_bonus_points` | Number | 额外赠送积分（活动专属） |
| `reach_level` | Number | 充值后可达等级 |

**索引**

```javascript
// 活动代码唯一
db.activities.createIndex({ activity_code: 1 }, { unique: true })

// 活动时间查询
db.activities.createIndex({ start_time: 1, end_time: 1 })

// 状态查询
db.activities.createIndex({ status: 1 })
```

---

### 10. admin_users（后台账号表）

存储后台管理员账号。

```json
{
  "_id": "ObjectId",
  "username": "admin",
  "password_hash": "$2b$10$...",
  "nickname": "管理员",
  "role": "super",
  "status": 1,
  "last_login_time": "2026-05-21T10:00:00Z",
  "create_time": "2026-01-01T00:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `username` | String | ✅ | - | 用户名（唯一） |
| `password_hash` | String | ✅ | - | bcrypt 密码哈希 |
| `nickname` | String | ✅ | - | 昵称 |
| `role` | String | ✅ | "admin" | 角色：super/admin/staff |
| `status` | Number | ✅ | 1 | 状态：1启用/0禁用 |
| `last_login_time` | Date | ❌ | null | 最后登录时间 |
| `create_time` | Date | ✅ | now | 创建时间 |

**索引**

```javascript
// 用户名唯一
db.admin_users.createIndex({ username: 1 }, { unique: true })
```

---

### 11. admin_operation_logs（后台操作日志）

记录后台管理员敏感操作，不可修改，只追加。

> **对应功能**：ADM-LOG-001~002

```json
{
  "_id": "ObjectId",
  "operator": "admin",
  "operator_id": "管理员ID",
  "operation_type": "point_adjust",
  "target": "用户_188xxxx",
  "target_id": "用户ID",
  "detail": "积分调整 +100，原因：补偿",
  "data_snapshot": {
    "before": { "points": 1150 },
    "after": { "points": 1250 }
  },
  "ip": "192.168.1.1",
  "create_time": "2026-05-21T15:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `operator` | String | ✅ | - | 操作人用户名 |
| `operator_id` | String | ✅ | - | 操作人ID |
| `operation_type` | String | ✅ | - | 操作类型 |
| `target` | String | ✅ | - | 操作对象描述 |
| `target_id` | String | ❌ | "" | 操作对象ID |
| `detail` | String | ✅ | - | 操作详情描述 |
| `data_snapshot` | Object | ❌ | null | 操作前后数据快照 |
| `ip` | String | ❌ | "" | 操作IP |
| `create_time` | Date | ✅ | now | 创建时间 |

**operation_type 枚举**

| 类型 | 说明 |
|:---|:---|
| `point_adjust` | 积分调整 |
| `balance_adjust` | 余额调整 |
| `refund` | 退款处理 |
| `goods_edit` | 商品编辑 |
| `order_operation` | 订单操作 |
| `table_manage` | 桌号管理 |
| `member_config` | 会员配置修改 |
| `account_manage` | 账号管理 |

**索引**

```javascript
// 时间倒序查询
db.admin_operation_logs.createIndex({ create_time: -1 })

// 操作人查询
db.admin_operation_logs.createIndex({ operator_id: 1, create_time: -1 })

// 操作类型筛选
db.admin_operation_logs.createIndex({ operation_type: 1, create_time: -1 })

// 操作对象查询
db.admin_operation_logs.createIndex({ target_id: 1 })
```

---

### 12. tables（桌号管理）

存储门店桌号配置及对应的桌台码。

> **对应功能**：ADM-TABLE-001~002

```json
{
  "_id": "ObjectId",
  "table_no": "A01",
  "status": 1,
  "qrcode_url": "https://cdn.example.com/qr/A01.png",
  "create_time": "2026-05-21T00:00:00Z",
  "update_time": "2026-05-21T10:00:00Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| `_id` | ObjectId | ✅ | auto | 主键 |
| `table_no` | String | ✅ | - | 桌号（唯一，如 A01、B12） |
| `status` | Number | ✅ | 1 | 状态：1启用/0停用 |
| `qrcode_url` | String | ❌ | "" | 桌台码二维码图片 URL |
| `create_time` | Date | ✅ | now | 创建时间 |
| `update_time` | Date | ✅ | now | 更新时间 |

**索引**

```javascript
// 桌号唯一
db.tables.createIndex({ table_no: 1 }, { unique: true })

// 状态查询
db.tables.createIndex({ status: 1 })
```

---

## 集合关系图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  member_levels  │     │     members     │     │   point_logs    │     │  balance_logs   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ _id (PK)        │     │ _id (PK)        │◄────┤ member_id (FK)  │     │ _id (PK)        │
│ level (UQ)      │────►│ level (FK)      │     │ change          │     │ member_id (FK)  │
│ level_name      │     │ nickname        │     │ reason          │◄────┤ change          │
│ drink_discount  │     │ points          │     │ expire_time     │     │ type            │
│ labor_discount  │     │ balance         │     │ create_time     │     │ order_no        │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       │ 1:N
         │                       ▼
         │              ┌─────────────────┐     ┌─────────────────┐
         │              │ recharge_logs   │     │     orders      │
         │              ├─────────────────┤     ├─────────────────┤
         │              │ _id (PK)        │     │ _id (PK)        │
         │              │ member_id (FK)  │     │ member_id (FK)  │
         │              │ activity_code   │────►│ activity_code   │
         └─────────────►│ tier_id         │     │ order_no (UQ)   │
                        │ pay_status      │     │ discount_detail │
                        └─────────────────┘     │ pay_amount      │
                                                │ order_status    │
                                                │ refund_status   │
                                                └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ community_posts │◄────┤community_comments│    │ community_likes │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ _id (PK)        │     │ post_id (FK)    │     │ post_id (FK)    │
│ author_id (FK)  │     │ author_id (FK)  │     │ user_id (FK)    │
│ content         │     │ content         │     └─────────────────┘
│ images          │     │ create_time     │
│ likes           │     └─────────────────┘
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   activities    │     │   admin_users   │     │admin_operation_logs│   │     tables      │
├─────────────────┤     ├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ _id (PK)        │     │ _id (PK)        │     │ _id (PK)         │     │ _id (PK)        │
│ activity_code   │     │ username (UQ)   │     │ operator_id (FK) │     │ table_no (UQ)   │
│ tier_configs    │     │ password_hash   │     │ operation_type   │     │ status          │
│ status          │     │ role            │     │ detail           │     │ qrcode_url      │
└─────────────────┘     └─────────────────┘     │ data_snapshot    │     └─────────────────┘
                                                └──────────────────┘
```

---

## 数据一致性约束

### 1. 会员积分一致性
- 积分变动必须通过 `point_logs` 记录
- 使用 MongoDB 事务保证 `members.points` 和 `point_logs` 一致性

### 2. 会员余额一致性
- 余额变动必须通过 `balance_logs` 记录
- 使用 MongoDB 事务保证 `members.balance` 和 `balance_logs` 一致性

### 3. 订单金额一致性
```
pay_amount = original_amount - discount_amount - point_deduct
```

### 4. 余额扣款原子性
使用 `findOneAndUpdate` 保证余额扣款的原子性：
```javascript
db.members.findOneAndUpdate(
  { _id: memberId, balance: { $gte: amount } },
  { $inc: { balance: -amount } },
  { returnDocument: 'after' }
)
```

### 5. 点赞唯一性
`community_likes` 的 `(post_id, user_id)` 复合唯一索引防止重复点赞

### 6. 退款数据一致性
- 退款时须同时：更新订单退款字段 + 回退积分 + 回退成长值 + 恢复库存
- 以上操作使用 MongoDB 事务保证原子性

---

## 数据归档策略

| 集合 | 归档策略 | 保留时长 |
|:---|:---|:---|
| `point_logs` | 按年归档 | 2年 |
| `recharge_logs` | 按年归档 | 5年 |
| `orders` | 按年归档 | 3年 |
| `community_posts` | 软删除 | 永久 |
| `community_comments` | 软删除 | 永久 |

---

*文档结束*
