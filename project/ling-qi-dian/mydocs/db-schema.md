# 数据库 Schema 设计文档

> 本文档定义机车俱乐部饮品与社区系统的全部 MongoDB 集合结构
> 版本: v1.0 | 日期: 2026-05-22

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
| `point_logs` | 积分流水 | 10万+ | 插入、查询 |
| `recharge_logs` | 充值记录 | 5万+ | 插入、查询 |
| `goods` | 商品信息 | 100+ | CRUD |
| `orders` | 订单主表 | 10万+ | CRUD |
| `community_posts` | 社区帖子 | 1万+ | CRUD |
| `community_comments` | 评论 | 5万+ | 插入、查询、删除 |
| `community_likes` | 点赞记录 | 10万+ | 插入、删除 |
| `admin_users` | 后台账号 | 10+ | CRUD |

---

## 会员相关集合

### 1. members（会员主表）

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
  
  "points": 1250,
  "total_points_earned": 5000,
  "total_points_used": 2250,
  "total_points_expired": 0,
  
  "balance": 11000,
  "total_consume": 80000,
  
  "last_check_in_date": "2026-05-20",
  "continuous_check_in_days": 5,
  
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
| `points` | Number | ✅ | 0 | 当前可用积分 |
| `total_points_earned` | Number | ✅ | 0 | 累计获得积分 |
| `total_points_used` | Number | ✅ | 0 | 累计使用积分 |
| `total_points_expired` | Number | ✅ | 0 | 累计过期积分 |
| `balance` | Number | ✅ | 0 | 储值余额（单位：分） |
| `total_consume` | Number | ✅ | 0 | 累计消费金额（单位：分） |
| `last_check_in_date` | String | ❌ | "" | 最后签到日期（YYYY-MM-DD） |
| `continuous_check_in_days` | Number | ✅ | 0 | 连续签到天数 |
| `create_time` | Date | ✅ | now | 创建时间 |
| `update_time` | Date | ✅ | now | 更新时间 |

**索引**

```javascript
// 等级查询
db.members.createIndex({ level: 1 })

// 充值排行
db.members.createIndex({ total_recharge: -1 })

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
| `expire_time` | Date | ❌ | null | 积分过期时间 |
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

### 3. recharge_logs（充值记录）

记录会员充值历史。

```json
{
  "_id": "ObjectId",
  "member_id": "用户ID",
  "recharge_amount": 100000,
  "bonus_balance": 10000,
  "bonus_points": 1100,
  "total_amount": 110000,
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
| `bonus_balance` | Number | ✅ | 0 | 赠送余额（单位：分） |
| `bonus_points` | Number | ✅ | 0 | 赠送积分 |
| `total_amount` | Number | ✅ | - | 实际到账余额（单位：分） |
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
  "point_deduct": 0,
  "pay_amount": 5000,
  
  "pay_way": "wechat",
  "pay_status": 1,
  "pay_time": "2026-05-21T14:35:00Z",
  
  "order_status": "completed",
  "remark": "少糖",
  
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
| `point_deduct` | Number | ✅ | 0 | 积分抵扣金额（分） |
| `pay_amount` | Number | ✅ | - | 实付金额（分） |
| `pay_way` | String | ✅ | - | 支付方式：wechat/balance/cash |
| `pay_status` | Number | ✅ | 0 | 支付状态：0待支付/1已支付/2已取消 |
| `pay_time` | Date | ❌ | null | 支付时间 |
| `order_status` | String | ✅ | "pending" | 订单状态 |
| `remark` | String | ❌ | "" | 备注 |
| `create_time` | Date | ✅ | now | 创建时间 |
| `update_time` | Date | ✅ | now | 更新时间 |

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

### 9. admin_users（后台账号表）

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

## 集合关系图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     members     │     │   point_logs    │     │ recharge_logs   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ _id (PK)        │◄────┤ member_id (FK)  │     │ member_id (FK)  │
│ nickname        │     │ change          │     │ recharge_amount │
│ level           │     │ reason          │     │ pay_status      │
│ points          │     │ create_time     │     │ create_time     │
│ balance         │     └─────────────────┘     └─────────────────┘
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐     ┌─────────────────┐
│     orders      │     │  order_goods    │ (embedded)
├─────────────────┤     ├─────────────────┤
│ _id (PK)        │     │ goods_id        │
│ member_id (FK)  │     │ goods_name      │
│ order_no (UQ)   │     │ sku_id          │
│ pay_amount      │     │ price           │
│ order_status    │     │ quantity        │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ community_posts │◄────┤community_comments│    │ community_likes │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ _id (PK)        │     │ post_id (FK)    │     │ post_id (FK)    │
│ author_id (FK)  │     │ author_id (FK)  │     │ user_id (FK)    │
│ content         │     │ content         │     └─────────────────┘
│ images          │     │ create_time     │
│ likes           │     └─────────────────┘
└─────────────────┘

┌─────────────────┐
│   admin_users   │
├─────────────────┤
│ _id (PK)        │
│ username (UQ)   │
│ password_hash   │
│ role            │
└─────────────────┘
```

---

## 数据一致性约束

### 1. 会员积分一致性
- 积分变动必须通过 `point_logs` 记录
- 使用 MongoDB 事务保证 `members.points` 和 `point_logs` 一致性

### 2. 订单金额一致性
```
pay_amount = original_amount - discount_amount - point_deduct
```

### 3. 余额扣款原子性
使用 `findOneAndUpdate` 保证余额扣款的原子性：
```javascript
db.members.findOneAndUpdate(
  { _id: memberId, balance: { $gte: amount } },
  { $inc: { balance: -amount } },
  { returnDocument: 'after' }
)
```

### 4. 点赞唯一性
`community_likes` 的 `(post_id, user_id)` 复合唯一索引防止重复点赞

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
