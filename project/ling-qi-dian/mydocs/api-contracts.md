# API 接口契约文档

> 本文档定义机车俱乐部系统的全部云函数接口契约
> 版本: v1.0 | 日期: 2026-05-22

---

## 目录

1. [全局约定](#全局约定)
2. [认证模块](#认证模块)
3. [商品模块](#商品模块)
4. [订单模块](#订单模块)
5. [会员模块](#会员模块)
6. [收银模块](#收银模块)
7. [社区模块](#社区模块)
8. [后台管理模块](#后台管理模块)

---

## 全局约定

### 1. 基础信息

- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- **金额单位**: 分 (Integer)

### 2. 认证方式

**客户端认证**: HTTP Header 携带 Token
```
Authorization: Bearer <token>
```

**后台管理认证**: JWT Token
```
Authorization: Bearer <jwt_token>
```

### 3. 响应格式

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

**错误响应**
```json
{
  "code": 10001,
  "message": "错误描述",
  "data": null
}
```

### 4. 分页格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 5. 全局错误码

| 错误码 | 说明 |
|:---|:---|
| `0` | 成功 |
| `10001` | 参数错误 |
| `10002` | 未授权/Token无效 |
| `10003` | 权限不足 |
| `10004` | 资源不存在 |
| `10005` | 服务器内部错误 |
| `10006` | 请求过于频繁 |
| `20001` | 余额不足 |
| `20002` | 库存不足 |
| `20003` | 订单状态异常 |
| `20004` | 支付失败 |

---

## 认证模块

### 1. 微信网页授权登录

**云函数**: `wx-auth`

**请求**
```http
POST /wx-auth
Content-Type: application/json

{
  "code": "微信授权code"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expire": 7200,
    "userInfo": {
      "uid": "用户ID",
      "nickname": "微信昵称",
      "avatar": "头像URL",
      "level": 1,
      "level_name": "青铜"
    }
  }
}
```

### 2. Token 校验

**云函数**: `check-token`

**请求**
```http
POST /check-token
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "valid": true,
    "userInfo": {
      "uid": "用户ID",
      "nickname": "微信昵称",
      "avatar": "头像URL",
      "level": 1,
      "level_name": "青铜"
    }
  }
}
```

### 3. 后台登录

**云函数**: `admin-login`

**请求**
```http
POST /admin-login
Content-Type: application/json

{
  "username": "admin",
  "password": "密码"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expire": 86400,
    "userInfo": {
      "id": "管理员ID",
      "username": "admin",
      "nickname": "管理员",
      "role": "super"
    }
  }
}
```

---

## 商品模块

### 4. 获取商品列表

**云函数**: `goods-list`

**请求**
```http
POST /goods-list
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "咖啡",
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "商品ID",
        "name": "美式咖啡",
        "category": "咖啡",
        "description": "精选阿拉比卡咖啡豆",
        "images": ["url1"],
        "status": 1,
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
        ]
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

### 5. 获取商品详情

**云函数**: `goods-detail`

**请求**
```http
POST /goods-detail
Authorization: Bearer <token>
Content-Type: application/json

{
  "goods_id": "商品ID"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "商品ID",
    "name": "美式咖啡",
    "category": "咖啡",
    "description": "精选阿拉比卡咖啡豆",
    "images": ["url1", "url2"],
    "status": 1,
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
    ]
  }
}
```

---

## 订单模块

### 6. 创建订单

**云函数**: `order-create`

**请求**
```http
POST /order-create
Authorization: Bearer <token>
Content-Type: application/json

{
  "table_no": "A01",
  "goods": [
    {
      "goods_id": "商品ID",
      "sku_id": "sku_001",
      "quantity": 2
    }
  ],
  "remark": "少糖",
  "use_points": 100
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "202605211430001",
    "pay_amount": 5000,
    "pay_params": {
      "appId": "wx...",
      "timeStamp": "1234567890",
      "nonceStr": "随机字符串",
      "package": "prepay_id=...",
      "signType": "RSA",
      "paySign": "签名"
    }
  }
}
```

### 7. 支付回调

**云函数**: `order-pay-callback`

**请求**
```http
POST /order-pay-callback
Content-Type: application/json

{
  "order_no": "202605211430001",
  "pay_result": {
    "status": "success",
    "transaction_id": "微信支付流水号",
    "pay_time": "2026-05-21T14:35:00Z"
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "202605211430001",
    "order_status": "paid",
    "pay_time": "2026-05-21T14:35:00Z"
  }
}
```

### 8. 查询订单列表

**云函数**: `order-list`

**请求**
```http
POST /order-list
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "all",
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "order_no": "202605211430001",
        "goods": [
          {
            "goods_name": "美式咖啡",
            "sku_name": "大杯/去冰",
            "quantity": 2,
            "price": 2500
          }
        ],
        "pay_amount": 5000,
        "order_status": "completed",
        "create_time": "2026-05-21T14:30:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

### 9. 查询订单详情

**云函数**: `order-detail`

**请求**
```http
POST /order-detail
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_no": "202605211430001"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "202605211430001",
    "table_no": "A01",
    "goods": [
      {
        "goods_name": "美式咖啡",
        "sku_name": "大杯/去冰",
        "quantity": 2,
        "price": 2500
      }
    ],
    "original_amount": 5000,
    "discount_amount": 0,
    "point_deduct": 0,
    "pay_amount": 5000,
    "pay_way": "wechat",
    "order_status": "completed",
    "remark": "少糖",
    "create_time": "2026-05-21T14:30:00Z",
    "pay_time": "2026-05-21T14:35:00Z"
  }
}
```

---

## 会员模块

### 10. 获取会员信息

**云函数**: `member-info`

**请求**
```http
POST /member-info
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "uid": "用户ID",
    "nickname": "微信昵称",
    "avatar": "头像URL",
    "mobile": "13800138000",
    "level": 1,
    "level_name": "青铜",
    "next_level_name": "白银",
    "next_level_amount": 2000,
    "total_recharge": 1000,
    "points": 1250,
    "balance": 11000,
    "total_consume": 80000,
    "benefits": {
      "drink_discount": 0.98,
      "labor_discount": 0.95,
      "points_multiplier": 1.1
    }
  }
}
```

### 11. 获取会员权益

**云函数**: `member-benefits`

**请求**
```http
POST /member-benefits
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "current": {
      "level": 1,
      "level_name": "青铜",
      "drink_discount": 0.98,
      "labor_discount": 0.95,
      "parts_discount": 1.0,
      "points_multiplier": 1.1,
      "car_wash_count": 0,
      "maintenance_discount": 0.95,
      "rescue_km": 0,
      "spare_car_days": 0,
      "has_exclusive_service": false,
      "birthday_coupon_count": 1
    },
    "all_levels": [
      {
        "level": 0,
        "level_name": "普通用户",
        "recharge_threshold": 0,
        "drink_discount": 1.0,
        "labor_discount": 1.0
      },
      {
        "level": 1,
        "level_name": "青铜",
        "recharge_threshold": 1000,
        "drink_discount": 0.98,
        "labor_discount": 0.95
      }
    ]
  }
}
```

### 12. 获取积分流水

**云函数**: `member-point-logs`

**请求**
```http
POST /member-point-logs
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason_code": "",
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "change": 150,
        "after_points": 1250,
        "reason": "消费奖励",
        "reason_code": "consume",
        "order_id": "订单ID",
        "create_time": "2026-05-21T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

### 13. 获取充值档位

**云函数**: `member-recharge-tiers`

**请求**
```http
POST /member-recharge-tiers
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "is_opening_activity": false,
    "tiers": [
      {
        "tier_id": 1,
        "amount": 19800,
        "bonus_balance": 1980,
        "bonus_points": 218,
        "reach_level": null,
        "level_name": "无等级"
      },
      {
        "tier_id": 3,
        "amount": 100000,
        "bonus_balance": 10000,
        "bonus_points": 1100,
        "reach_level": 1,
        "level_name": "青铜"
      }
    ]
  }
}
```

### 14. 发起充值

**云函数**: `member-recharge`

**请求**
```http
POST /member-recharge
Authorization: Bearer <token>
Content-Type: application/json

{
  "tier_id": 3
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "R202605210001",
    "amount": 100000,
    "pay_params": {
      "appId": "wx...",
      "timeStamp": "1234567890",
      "nonceStr": "随机字符串",
      "package": "prepay_id=...",
      "signType": "RSA",
      "paySign": "签名"
    }
  }
}
```

### 15. 获取充值记录

**云函数**: `member-recharge-logs`

**请求**
```http
POST /member-recharge-logs
Authorization: Bearer <token>
Content-Type: application/json

{
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "order_no": "R202605210001",
        "recharge_amount": 100000,
        "bonus_balance": 10000,
        "bonus_points": 1100,
        "total_amount": 110000,
        "pay_status": 1,
        "pay_time": "2026-05-21T10:00:00Z",
        "create_time": "2026-05-21T09:50:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 收银模块

### 16. 店员创建订单

**云函数**: `cashier-order-create`

**请求**
```http
POST /cashier-order-create
Authorization: Bearer <token>
Content-Type: application/json

{
  "table_no": "A01",
  "goods": [
    {
      "goods_id": "商品ID",
      "sku_id": "sku_001",
      "quantity": 2
    }
  ],
  "pay_way": "cash",
  "member_code": "会员码"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "202605211430001",
    "pay_amount": 5000,
    "discount_amount": 100,
    "member_info": {
      "nickname": "会员昵称",
      "level_name": "青铜"
    }
  }
}
```

### 17. 余额支付

**云函数**: `cashier-balance-pay`

**请求**
```http
POST /cashier-balance-pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_no": "202605211430001",
  "member_code": "会员码"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "202605211430001",
    "pay_status": 1,
    "balance_after": 6000,
    "pay_time": "2026-05-21T14:35:00Z"
  }
}
```

### 18. 解析会员码

**云函数**: `member-code-decode`

**请求**
```http
POST /member-code-decode
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "会员码"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "member_id": "用户ID",
    "nickname": "微信昵称",
    "level": 1,
    "level_name": "青铜",
    "balance": 11000,
    "points": 1250
  }
}
```

---

## 社区模块

### 19. 创建帖子

**云函数**: `community-post-create`

**请求**
```http
POST /community-post-create
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "今天骑行了铁山坪，风景真不错！",
  "images": ["url1", "url2"],
  "route_info": {
    "start": "铁山坪",
    "end": "南山",
    "distance": 50,
    "duration": 120
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "post_id": "帖子ID",
    "create_time": "2026-05-21T10:00:00Z"
  }
}
```

### 20. 获取帖子列表

**云函数**: `community-post-list`

**请求**
```http
POST /community-post-list
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "all",
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "post_id": "帖子ID",
        "author": {
          "uid": "用户ID",
          "nickname": "微信昵称",
          "avatar": "头像URL"
        },
        "content": "今天骑行了铁山坪...",
        "images": ["url1", "url2"],
        "route_info": {
          "start": "铁山坪",
          "end": "南山",
          "distance": 50
        },
        "likes": 15,
        "comments_count": 8,
        "is_liked": false,
        "create_time": "2026-05-21T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 21. 获取帖子详情

**云函数**: `community-post-detail`

**请求**
```http
POST /community-post-detail
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": "帖子ID"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "post_id": "帖子ID",
    "author": {
      "uid": "用户ID",
      "nickname": "微信昵称",
      "avatar": "头像URL"
    },
    "content": "今天骑行了铁山坪...",
    "images": ["url1", "url2"],
    "route_info": {
      "start": "铁山坪",
      "end": "南山",
      "distance": 50,
      "duration": 120,
      "path": [[106.5, 29.6], [106.6, 29.7]]
    },
    "likes": 15,
    "comments_count": 8,
    "is_liked": false,
    "create_time": "2026-05-21T10:00:00Z"
  }
}
```

### 22. 点赞/取消点赞

**云函数**: `community-post-like`

**请求**
```http
POST /community-post-like
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": "帖子ID",
  "action": "like"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "post_id": "帖子ID",
    "is_liked": true,
    "likes": 16
  }
}
```

### 23. 发表评论

**云函数**: `community-comment-create`

**请求**
```http
POST /community-comment-create
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": "帖子ID",
  "content": "风景确实不错！",
  "reply_to": ""
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "comment_id": "评论ID",
    "create_time": "2026-05-21T11:00:00Z"
  }
}
```

### 24. 获取评论列表

**云函数**: `community-comment-list`

**请求**
```http
POST /community-comment-list
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": "帖子ID",
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "comment_id": "评论ID",
        "author": {
          "uid": "用户ID",
          "nickname": "微信昵称",
          "avatar": "头像URL"
        },
        "content": "风景确实不错！",
        "reply_to": null,
        "create_time": "2026-05-21T11:00:00Z"
      }
    ],
    "total": 8,
    "page": 1,
    "pageSize": 20
  }
}
```

### 25. 删除帖子

**云函数**: `community-post-delete`

**请求**
```http
POST /community-post-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": "帖子ID"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "post_id": "帖子ID"
  }
}
```

---

## 后台管理模块

### 26. 获取商品列表（后台）

**云函数**: `admin-goods-list`

**请求**
```http
POST /admin-goods-list
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "keyword": "",
  "category": "",
  "status": 1,
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "商品ID",
        "name": "美式咖啡",
        "category": "咖啡",
        "price_range": "18.00-25.00",
        "stock": 50,
        "status": 1,
        "create_time": "2026-01-01T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

### 27. 保存商品

**云函数**: `admin-goods-save`

**请求**
```http
POST /admin-goods-save
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "id": "",
  "name": "美式咖啡",
  "category": "咖啡",
  "description": "精选阿拉比卡咖啡豆",
  "images": ["url1"],
  "status": 1,
  "sku_list": [
    {
      "sku_id": "",
      "name": "大杯/去冰",
      "price": 2500,
      "stock": 50,
      "specs": {
        "size": "大杯",
        "temperature": "去冰"
      }
    }
  ]
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "商品ID"
  }
}
```

### 28. 获取订单列表（后台）

**云函数**: `admin-orders-list`

**请求**
```http
POST /admin-orders-list
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "order_no": "",
  "status": "",
  "start_time": "2026-05-01",
  "end_time": "2026-05-31",
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "order_no": "202605211430001",
        "member_nickname": "微信昵称",
        "goods_summary": "美式咖啡等2件",
        "pay_amount": 5000,
        "pay_way": "wechat",
        "order_status": "completed",
        "create_time": "2026-05-21T14:30:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 29. 获取会员列表

**云函数**: `admin-members-list`

**请求**
```http
POST /admin-members-list
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "keyword": "",
  "level": 0,
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "uid": "用户ID",
        "nickname": "微信昵称",
        "level": 1,
        "level_name": "青铜",
        "points": 1250,
        "balance": 11000,
        "total_consume": 80000,
        "create_time": "2026-01-01T00:00:00Z"
      }
    ],
    "total": 1000,
    "page": 1,
    "pageSize": 20
  }
}
```

### 30. 获取会员详情

**云函数**: `admin-members-detail`

**请求**
```http
POST /admin-members-detail
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "uid": "用户ID"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "uid": "用户ID",
    "nickname": "微信昵称",
    "avatar": "头像URL",
    "mobile": "13800138000",
    "level": 1,
    "level_name": "青铜",
    "total_recharge": 100000,
    "points": 1250,
    "balance": 11000,
    "total_consume": 80000,
    "recent_orders": [],
    "recent_points": []
  }
}
```

### 31. 调整会员积分

**云函数**: `admin-point-adjust`

**请求**
```http
POST /admin-point-adjust
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "uid": "用户ID",
  "change": 100,
  "reason": "补偿积分"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "uid": "用户ID",
    "points_before": 1150,
    "points_after": 1250,
    "change": 100
  }
}
```

### 32. 获取社区帖子列表（后台）

**云函数**: `admin-community-posts`

**请求**
```http
POST /admin-community-posts
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "keyword": "",
  "status": 1,
  "page": 1,
  "pageSize": 20
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "post_id": "帖子ID",
        "author_nickname": "微信昵称",
        "content_preview": "今天骑行了铁山坪...",
        "likes": 15,
        "comments_count": 8,
        "status": 1,
        "create_time": "2026-05-21T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 33. 删除社区帖子（后台）

**云函数**: `admin-post-delete`

**请求**
```http
POST /admin-post-delete
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "post_id": "帖子ID"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "post_id": "帖子ID"
  }
}
```

### 34. 更新订单状态

**云函数**: `admin-order-update`

**请求**
```http
POST /admin-order-update
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "order_no": "202605211430001",
  "order_status": "making"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "202605211430001",
    "order_status": "making",
    "update_time": "2026-05-21T14:40:00Z"
  }
}
```

---

## 接口汇总表

| 序号 | 云函数 | 模块 | 说明 |
|:---:|:---|:---|:---|
| 1 | `wx-auth` | 认证 | 微信登录 |
| 2 | `check-token` | 认证 | Token校验 |
| 3 | `admin-login` | 认证 | 后台登录 |
| 4 | `goods-list` | 商品 | 商品列表 |
| 5 | `goods-detail` | 商品 | 商品详情 |
| 6 | `order-create` | 订单 | 创建订单 |
| 7 | `order-pay-callback` | 订单 | 支付回调 |
| 8 | `order-list` | 订单 | 订单列表 |
| 9 | `order-detail` | 订单 | 订单详情 |
| 10 | `member-info` | 会员 | 会员信息 |
| 11 | `member-benefits` | 会员 | 会员权益 |
| 12 | `member-point-logs` | 会员 | 积分流水 |
| 13 | `member-recharge-tiers` | 会员 | 充值档位 |
| 14 | `member-recharge` | 会员 | 发起充值 |
| 15 | `member-recharge-logs` | 会员 | 充值记录 |
| 16 | `cashier-order-create` | 收银 | 店员下单 |
| 17 | `cashier-balance-pay` | 收银 | 余额支付 |
| 18 | `member-code-decode` | 收银 | 解析会员码 |
| 19 | `community-post-create` | 社区 | 创建帖子 |
| 20 | `community-post-list` | 社区 | 帖子列表 |
| 21 | `community-post-detail` | 社区 | 帖子详情 |
| 22 | `community-post-like` | 社区 | 点赞/取消 |
| 23 | `community-comment-create` | 社区 | 发表评论 |
| 24 | `community-comment-list` | 社区 | 评论列表 |
| 25 | `community-post-delete` | 社区 | 删除帖子 |
| 26 | `admin-goods-list` | 后台 | 商品列表 |
| 27 | `admin-goods-save` | 后台 | 保存商品 |
| 28 | `admin-orders-list` | 后台 | 订单列表 |
| 29 | `admin-members-list` | 后台 | 会员列表 |
| 30 | `admin-members-detail` | 后台 | 会员详情 |
| 31 | `admin-point-adjust` | 后台 | 积分调整 |
| 32 | `admin-community-posts` | 后台 | 帖子管理 |
| 33 | `admin-post-delete` | 后台 | 删除帖子 |
| 34 | `admin-order-update` | 后台 | 更新订单 |

---

*文档结束*
