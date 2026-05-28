# API 接口契约文档

> 本文档定义机车俱乐部系统的全部云函数接口契约
> 版本: v2.1 | 日期: 2026-05-24
>
> **产品基准**：`full-feature-list.md` v3.0 | 接口覆盖：全部 51 个云函数

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
| `20005` | 活动已结束 |
| `20006` | 不在活动期 |

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

> **字段说明**：
> - `level`: 等级值（0-6，0=普通用户）
> - `level_name`: 普通用户/青铜/白银/黄金/铂金/钻石/至尊

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

> **字段说明**：
> - `level`: 等级值（0-6，0=普通用户）
> - `level_name`: 普通用户/青铜/白银/黄金/铂金/钻石/至尊

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
      "quantity": 2,
      "category": "咖啡"
    }
  ],
  "remark": "少糖",
  "use_points": 100
}
```

> **参数说明**：
> - `goods[].category`: 商品品类，用于分品类折扣计算（如：咖啡、饮品、工时费、配件）

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "202605211430001",
    "pay_amount": 5000,
    "discount_detail": {
      "drink_discount_amount": 0,
      "labor_discount_amount": 0,
      "parts_discount_amount": 0,
      "total_discount_amount": 0
    },
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
    "discount_detail": {
      "drink_discount_amount": 0,
      "labor_discount_amount": 0,
      "parts_discount_amount": 0,
      "total_discount_amount": 0
    },
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
    "next_level_amount": 200000,
    "total_recharge": 100000,
    "points": 1250,
    "balance": 11000,
    "total_consume": 80000,
    "benefits": {
      "drink_discount": 0.98,
      "labor_discount": 0.95,
      "parts_discount": 1.0,
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
        "labor_discount": 1.0,
        "parts_discount": 1.0,
        "points_multiplier": 1.0,
        "car_wash_count": 0,
        "maintenance_discount": 1.0,
        "rescue_km": 0,
        "spare_car_days": 0,
        "has_exclusive_service": false,
        "birthday_coupon_count": 0
      },
      {
        "level": 1,
        "level_name": "青铜",
        "recharge_threshold": 100000,
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
      {
        "level": 2,
        "level_name": "白银",
        "recharge_threshold": 300000,
        "drink_discount": 0.95,
        "labor_discount": 0.90,
        "parts_discount": 1.0,
        "points_multiplier": 1.2,
        "car_wash_count": 1,
        "maintenance_discount": 0.90,
        "rescue_km": 0,
        "spare_car_days": 0,
        "has_exclusive_service": false,
        "birthday_coupon_count": 2
      },
      {
        "level": 3,
        "level_name": "黄金",
        "recharge_threshold": 800000,
        "drink_discount": 0.90,
        "labor_discount": 0.85,
        "parts_discount": 0.98,
        "points_multiplier": 1.3,
        "car_wash_count": 2,
        "maintenance_discount": 0.85,
        "rescue_km": 50,
        "spare_car_days": 0,
        "has_exclusive_service": false,
        "birthday_coupon_count": 3
      },
      {
        "level": 4,
        "level_name": "铂金",
        "recharge_threshold": 1500000,
        "drink_discount": 0.85,
        "labor_discount": 0.80,
        "parts_discount": 0.95,
        "points_multiplier": 1.5,
        "car_wash_count": 3,
        "maintenance_discount": 0.80,
        "rescue_km": 80,
        "spare_car_days": 0,
        "has_exclusive_service": true,
        "birthday_coupon_count": 5
      },
      {
        "level": 5,
        "level_name": "钻石",
        "recharge_threshold": 3000000,
        "drink_discount": 0.80,
        "labor_discount": 0.75,
        "parts_discount": 0.90,
        "points_multiplier": 1.8,
        "car_wash_count": 4,
        "maintenance_discount": 0.80,
        "rescue_km": 100,
        "spare_car_days": 3,
        "has_exclusive_service": true,
        "birthday_coupon_count": 6
      },
      {
        "level": 6,
        "level_name": "至尊",
        "recharge_threshold": 5000000,
        "drink_discount": 0.80,
        "labor_discount": 0.70,
        "parts_discount": 0.90,
        "points_multiplier": 2.0,
        "car_wash_count": 999,
        "maintenance_discount": 0.80,
        "rescue_km": 200,
        "spare_car_days": 7,
        "has_exclusive_service": true,
        "birthday_coupon_count": 10
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
        "expire_time": "2027-05-21T00:00:00Z",
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
Content-Type: application/json

{}
```

> **参数说明**：无额外参数（开业活动移至二期）

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "tiers": [
      {
        "tier_id": 1,
        "amount": 19800,
        "bonus_points": 198,
        "growth_value": 198,
        "reach_level": null
      },
      {
        "tier_id": 2,
        "amount": 68000,
        "bonus_points": 680,
        "growth_value": 680,
        "reach_level": null
      },
      {
        "tier_id": 3,
        "amount": 298000,
        "bonus_points": 2980,
        "growth_value": 2980,
        "reach_level": 1
      },
      {
        "tier_id": 4,
        "amount": 598000,
        "bonus_points": 5980,
        "growth_value": 5980,
        "reach_level": 2
      }
    ]
  }
}
```

> **字段说明**：
> - `amount`: 充值金额（单位：分）
> - `bonus_points`: 赠送积分（= 充值金额元，1:1:1模型）
> - `growth_value`: 成长值（= 充值金额元，1:1:1模型）
> - `reach_level`: 单次充值可达等级（null 表示无等级）
>
> **二期扩展**：开业活动时将增加 `extra_bonus_points`、`extra_growth_value`、`remark` 字段

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

> **参数说明**：
> - `tier_id`: 充值档位ID。可传入平时档位ID（1-5）或活动档位ID（11-14）

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "R202605210001",
    "amount": 100000,
    "activity_code": "OPENING_2026",
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

> **字段说明**：
> - `activity_code`: 关联活动编码，非活动期为空字符串

### 15. H5 端余额支付

**云函数**: `member-balance-pay`

> **对应功能**：H5-PAY-004

**请求**
```http
POST /member-balance-pay
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
    "pay_amount": 5000,
    "balance_before": 11000,
    "balance_after": 6000,
    "pay_time": "2026-05-21T14:35:00Z"
  }
}
```

**错误响应**
```json
{
  "code": 20001,
  "message": "余额不足",
  "data": null
}
```

> **字段说明**：
> - `balance_before`: 支付前余额（单位：分）
> - `balance_after`: 支付后余额（单位：分）
> - 扣款为原子操作，使用 `findOneAndUpdate` 带余额条件保证不超扣

### 16. 获取充值记录

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
        "recharge_amount": 298000,
        "bonus_points": 2980,
        "growth_value": 2980,
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

### 17. 申请退款（H5 端）

**云函数**: `refund-request`

> **对应功能**：H5-ORDER-LIST-007

**请求**
```http
POST /refund-request
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
  "message": "退款申请已提交",
  "data": {
    "order_no": "202605211430001",
    "refund_status": "pending",
    "create_time": "2026-05-21T15:00:00Z"
  }
}
```

**错误响应**
```json
{
  "code": 20003,
  "message": "当前订单状态不支持退款",
  "data": null
}
```

> **字段说明**：
> - 仅"待取餐"和"制作中"状态的订单可申请退款
> - `refund_status`: pending（待处理）/ approved（已退款）/ rejected（已驳回）
> - 退款完成后订单状态变为"已取消"，积分和成长值自动回退

### 18. 余额流水查询

**云函数**: `member-balance-logs`

> **对应功能**：H5-BALANCE-002~003

**请求**
```http
POST /member-balance-logs
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "",
  "page": 1,
  "pageSize": 20
}
```

> **参数说明**：
> - `type`: 筛选类型，空=全部，可选：recharge（充值）/ consume（消费）/ refund（退款）/ adjust（调整）

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "日志ID",
        "change": 5000,
        "after_balance": 11000,
        "reason": "充值",
        "type": "recharge",
        "order_no": "R202605210001",
        "create_time": "2026-05-21T10:00:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 20
  }
}
```

> **字段说明**：
> - `change`: 变动金额（正数增加，负数减少，单位：分）
> - `after_balance`: 变动后余额（单位：分）
> - `type`: 变动类型（recharge/consume/refund/adjust）

### 19. 查询支付状态

**云函数**: `member-reconnect`

> **对应功能**：H5-PAY-005

**请求**
```http
POST /member-reconnect
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
    "pay_status": 1,
    "pay_time": "2026-05-21T14:35:00Z"
  }
}
```

> **字段说明**：
> - `pay_status`: 0=待支付，1=已支付，2=已取消
> - H5 端支付后每 2 秒轮询此接口，最多 30 秒

---

## 收银模块

### 20. 店员创建订单

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
      "quantity": 2,
      "category": "咖啡"
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
    "discount_detail": {
      "drink_discount_amount": 50,
      "labor_discount_amount": 0,
      "parts_discount_amount": 0,
      "total_discount_amount": 50
    },
    "member_info": {
      "nickname": "会员昵称",
      "level_name": "青铜",
      "benefits": {
        "drink_discount": 0.98,
        "labor_discount": 0.95,
        "parts_discount": 1.0
      }
    }
  }
}
```

### 21. 余额支付

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

### 22. 解析会员码

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

### 23. 创建帖子

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

### 24. 获取帖子列表

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

### 25. 获取帖子详情

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

### 26. 点赞/取消点赞

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

### 27. 发表评论

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

### 28. 获取评论列表

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

### 29. 删除帖子

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

### 30. 获取商品列表（后台）

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

### 31. 保存商品

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

### 32. 获取订单列表（后台）

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

### 33. 获取会员列表

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
        "total_recharge": 100000,
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

### 34. 获取会员详情

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
    "recent_points": [
      {
        "change": 150,
        "after_points": 1250,
        "reason": "消费奖励",
        "reason_code": "consume",
        "order_id": "订单ID",
        "expire_time": "2027-05-21T00:00:00Z",
        "create_time": "2026-05-21T10:00:00Z"
      }
    ]
  }
}
```

### 35. 调整会员积分

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

### 36. 获取社区帖子列表（后台）

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

### 37. 删除社区帖子（后台）

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

### 38. 更新订单状态

**云函数**: `admin-order-update`

> **对应功能**：ADM-ORDER-002

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

> **order_status 可选值**：`making`（开始制作）/ `completed`（完成订单）/ `cancelled`（取消订单）

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

> **状态流转规则**：
> - 待取餐 → 制作中（making）或 已取消（cancelled）
> - 制作中（making）→ 已完成（completed）
> - 已完成/已取消状态不可再变更
> - 退款状态下通过 `admin-refund-process` 单独处理

---

### 39. 退款处理

**云函数**: `admin-refund-process`

> **对应功能**：ADM-ORDER-003

**请求**
```http
POST /admin-refund-process
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "order_no": "202605211430001",
  "refund_amount": 5000,
  "reason": "customer_cancel",
  "remark": "顾客取消订单"
}
```

> **参数说明**：
> - `refund_amount`: 退款金额（单位：分），默认填入实付金额，可修改
> - `reason`: 退款原因，可选：`customer_cancel`（顾客取消）/ `goods_issue`（商品问题）/ `other`（其他）

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_no": "202605211430001",
    "order_status": "cancelled",
    "refund_status": "approved",
    "refund_amount": 5000,
    "refund_time": "2026-05-21T15:10:00Z"
  }
}
```

**错误响应**
```json
{
  "code": 20003,
  "message": "订单已完成，无法退款",
  "data": null
}
```

> **处理逻辑**：
> - 仅"待取餐"和"制作中"状态可退款
> - 微信支付：调用收钱吧退款 API 原路退回
> - 余额支付：退回余额账户
> - 退款后自动回退积分和成长值，恢复库存
> - 订单状态变为 `cancelled`

---

### 40. 会员充值记录查询（后台）

**云函数**: `admin-recharge-logs`

**请求**
```http
POST /admin-recharge-logs
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "member_id": "用户ID",
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
        "recharge_amount": 298000,
        "bonus_points": 2980,
        "growth_value": 2980,
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

### 41. 余额调整（后台）

**云函数**: `admin-balance-adjust`

**请求**
```http
POST /admin-balance-adjust
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "member_id": "用户ID",
  "adjust_amount": 5000,
  "reason": "线下退款"
}
```

> **参数说明**：
> - `adjust_amount`: 调整金额（单位：分），正数增加余额，负数扣减余额
> - `reason`: 调整原因

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "member_id": "用户ID",
    "balance_before": 10000,
    "balance_after": 15000,
    "adjust_amount": 5000
  }
}
```

### 42. 等级权益配置查询（后台）

**云函数**: `admin-member-levels`

**请求**
```http
POST /admin-member-levels
Authorization: Bearer <admin_token>
Content-Type: application/json

{}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "levels": [
      {
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
        "birthday_coupon_count": 0
      }
    ]
  }
}
```

### 43. 等级权益配置保存（后台）

**云函数**: `admin-member-levels-save`

**请求**
```http
POST /admin-member-levels-save
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "level": 1,
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
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "level": 1,
    "update_time": "2026-05-21T10:00:00Z"
  }
}
```

### 44. 充值档位配置查询（后台）

**云函数**: `admin-recharge-tiers`

**请求**
```http
POST /admin-recharge-tiers
Authorization: Bearer <admin_token>
Content-Type: application/json

{}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "tiers": [
      {
        "tier_id": 1,
        "amount": 19800,
        "bonus_points": 198,
        "growth_value": 198,
        "reach_level": null,
        "is_enabled": true
      }
    ]
  }
}
```

### 45. 充值档位配置保存（后台）

**云函数**: `admin-recharge-tiers-save`

**请求**
```http
POST /admin-recharge-tiers-save
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "tier_id": 1,
  "amount": 19800,
  "bonus_points": 198,
  "growth_value": 198,
  "is_enabled": true
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "tier_id": 1,
    "update_time": "2026-05-21T10:00:00Z"
  }
}
```

---

### 46. 营业报表

**云函数**: `admin-report-dashboard`

> **对应功能**：ADM-REPORT-001

**请求**
```http
POST /admin-report-dashboard
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "start_date": "2026-05-01",
  "end_date": "2026-05-31",
  "granularity": "day"
}
```

> **参数说明**：
> - `granularity`: `day`（按日）/ `week`（按周）/ `month`（按月）

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "summary": {
      "total_amount": 150000,
      "order_count": 320,
      "avg_order_amount": 468,
      "refund_amount": 5000
    },
    "trend": [
      { "date": "2026-05-01", "amount": 5000, "order_count": 10 },
      { "date": "2026-05-02", "amount": 4800, "order_count": 12 }
    ]
  }
}
```

### 47. 商品销售排行

**云函数**: `admin-report-goods-ranking`

> **对应功能**：ADM-REPORT-002

**请求**
```http
POST /admin-report-goods-ranking
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "start_date": "2026-05-01",
  "end_date": "2026-05-31",
  "sort_by": "sales",
  "limit": 20
}
```

> **参数说明**：
> - `sort_by`: `sales`（按销量）/ `amount`（按销售额）

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "rank": 1,
        "goods_name": "美式咖啡",
        "category": "咖啡",
        "sales": 120,
        "amount": 216000,
        "percentage": 0.15
      }
    ]
  }
}
```

### 48. 会员统计报表

**云函数**: `admin-report-member-stats`

> **对应功能**：ADM-REPORT-003

**请求**
```http
POST /admin-report-member-stats
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "start_date": "2026-05-01",
  "end_date": "2026-05-31"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "member_growth": [
      { "date": "2026-05-01", "new_count": 5 }
    ],
    "recharge_summary": {
      "total_amount": 500000,
      "total_count": 20,
      "conversion_rate": 0.12
    },
    "level_distribution": [
      { "level_name": "普通用户", "count": 800 },
      { "level_name": "青铜", "count": 120 }
    ]
  }
}
```

### 49. 操作日志查询

**云函数**: `admin-operation-logs`

> **对应功能**：ADM-LOG-001~002

**请求**
```http
POST /admin-operation-logs
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "operator": "",
  "operation_type": "",
  "start_time": "2026-05-01T00:00:00Z",
  "end_time": "2026-05-31T23:59:59Z",
  "page": 1,
  "pageSize": 20
}
```

> **参数说明**：
> - `operation_type`: 空=全部，可选：`point_adjust`（积分调整）/ `balance_adjust`（余额调整）/ `refund`（退款）/ `goods_edit`（商品编辑）/ `order_operation`（订单操作）
> - 仅 super 角色可查询

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "日志ID",
        "operator": "管理员 username",
        "operation_type": "point_adjust",
        "target": "用户_188xxxx",
        "detail": "积分调整 +100，原因：补偿",
        "data_snapshot": {
          "before": { "points": 1150 },
          "after": { "points": 1250 }
        },
        "ip": "192.168.1.1",
        "create_time": "2026-05-21T15:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

### 50. 桌号列表查询

**云函数**: `admin-table-list`

> **对应功能**：ADM-TABLE-001

**请求**
```http
POST /admin-table-list
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": 1,
  "page": 1,
  "pageSize": 50
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
        "id": "桌号ID",
        "table_no": "A01",
        "status": 1,
        "qrcode_url": "https://cdn.example.com/qr/A01.png",
        "create_time": "2026-05-21T00:00:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 50
  }
}
```

### 51. 桌号保存 & 生成桌台码

**云函数**: `admin-table-save`

> **对应功能**：ADM-TABLE-001~002

**请求**
```http
POST /admin-table-save
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "id": "",
  "table_no": "A01",
  "status": 1,
  "generate_qrcode": true
}
```

> **参数说明**：
> - `id`: 为空时新增，非空时更新
> - `generate_qrcode`: 是否生成桌台码二维码，批量生成时多次调用

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "桌号ID",
    "table_no": "A01",
    "qrcode_url": "https://cdn.example.com/qr/A01.png",
    "qrcode_content": "https://m.bikeclub.cn/?table=A01",
    "update_time": "2026-05-21T10:00:00Z"
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
| 15 | `member-balance-pay` | 会员 | H5端余额支付 |
| 16 | `member-recharge-logs` | 会员 | 充值记录 |
| 17 | `refund-request` | 订单 | H5端申请退款 |
| 18 | `member-balance-logs` | 会员 | 余额流水查询 |
| 19 | `member-reconnect` | 订单 | 支付状态轮询 |
| 20 | `cashier-order-create` | 收银 | 店员下单 |
| 21 | `cashier-balance-pay` | 收银 | 收银端余额支付 |
| 22 | `member-code-decode` | 收银 | 解析会员码 |
| 23 | `community-post-create` | 社区 | 创建帖子 |
| 24 | `community-post-list` | 社区 | 帖子列表 |
| 25 | `community-post-detail` | 社区 | 帖子详情 |
| 26 | `community-post-like` | 社区 | 点赞/取消 |
| 27 | `community-comment-create` | 社区 | 发表评论 |
| 28 | `community-comment-list` | 社区 | 评论列表 |
| 29 | `community-post-delete` | 社区 | 删除帖子 |
| 30 | `admin-goods-list` | 后台 | 商品列表 |
| 31 | `admin-goods-save` | 后台 | 保存商品 |
| 32 | `admin-orders-list` | 后台 | 订单列表 |
| 33 | `admin-members-list` | 后台 | 会员列表 |
| 34 | `admin-members-detail` | 后台 | 会员详情 |
| 35 | `admin-point-adjust` | 后台 | 积分调整 |
| 36 | `admin-community-posts` | 后台 | 帖子管理 |
| 37 | `admin-post-delete` | 后台 | 删除帖子 |
| 38 | `admin-order-update` | 后台 | 更新订单状态 |
| 39 | `admin-refund-process` | 后台 | 退款处理 |
| 40 | `admin-recharge-logs` | 后台 | 会员充值记录 |
| 41 | `admin-balance-adjust` | 后台 | 余额调整 |
| 42 | `admin-member-levels` | 后台 | 等级权益配置查询 |
| 43 | `admin-member-levels-save` | 后台 | 等级权益配置保存 |
| 44 | `admin-recharge-tiers` | 后台 | 充值档位配置查询 |
| 45 | `admin-recharge-tiers-save` | 后台 | 充值档位配置保存 |
| 46 | `admin-report-dashboard` | 后台 | 营业报表 |
| 47 | `admin-report-goods-ranking` | 后台 | 商品销售排行 |
| 48 | `admin-report-member-stats` | 后台 | 会员统计报表 |
| 49 | `admin-operation-logs` | 后台 | 操作日志查询 |
| 50 | `admin-table-list` | 后台 | 桌号列表查询 |
| 51 | `admin-table-save` | 后台 | 桌号保存&桌台码 |

---

*文档结束*
