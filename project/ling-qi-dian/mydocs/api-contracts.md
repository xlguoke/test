# API 接口契约文档

> 本文档定义机车俱乐部系统的全部云函数接口契约
> 版本: v3.0 | 日期: 2026-05-31
>
> **产品基准**：`full-feature-list.md` v3.8 | 接口覆盖：全部 51 个云函数（合并后约 15 个入口）

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
9. [微信模块](#微信模块)

---

## 全局约定

### 1. 基础信息

- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- **金额单位**: 分 (Integer)

### 2. 认证方式

**H5 端认证**: Cookie-based withCredentials 模式
- 服务端通过 Set-Cookie 下发 httpOnly Cookie（含 access_token + refresh_token）
- 前端请求配置 withCredentials: true，浏览器自动携带 Cookie
- 服务端从 Cookie 解析 Token

**后台管理认证**: JWT Token（Header 方式）
```
Authorization: Bearer <jwt_token>
```

### 3. 响应格式

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": { }
}
```

**错误响应**
```json
{
  "code": 10001,
  "message": "错误描述",
  "request_id": "uuid-v4",
  "data": null
}
```

### 4. 分页格式

```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "has_more": true
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
| `10007` | 验证码错误 |
| `10008` | 验证码已过期 |
| `10009` | 验证码发送频率超限 |
| `10010` | Token 刷新失败 |
| `10011` | 账号已锁定 |
| `20001` | 余额不足 |
| `20002` | 库存不足 |
| `20003` | 订单状态异常 |
| `20004` | 支付失败 |
| `20005` | 活动已结束 |
| `20006` | 不在活动期 |
| `20007` | 订单版本冲突（乐观锁） |
| `20008` | 重复请求（requestId 去重） |

---

## 认证模块

### 1. 微信网页授权登录

**云函数**: `auth`（路由分发）

**请求**
```http
POST /api/v1/auth/wx-login
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
  "request_id": "uuid-v4",
  "data": {
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
> - Token 通过 Set-Cookie 下发（httpOnly Cookie 含 access_token + refresh_token）

### 2. 手机号+验证码登录

**云函数**: `auth`（路由分发）

**请求**
```http
POST /api/v1/auth/phone-login
Content-Type: application/json

{
  "phone": "13800138000",
  "sms_code": "123456"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
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
> - 服务端根据手机号查询/创建用户，下发 Token（Set-Cookie）

### 3. 发送验证码

**云函数**: `auth`（路由分发）

**请求**
```http
POST /api/v1/auth/sms-code
Content-Type: application/json

{
  "phone": "13800138000"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
    "expire_in": 300
  }
}
```

> **限流**：1次/分钟/手机号，5次/天/手机号

### 4. Token 校验

**云函数**: `auth`（路由分发）

**请求**
```http
POST /api/v1/auth/check-token
Cookie: 自动携带（withCredentials: true）
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
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

### 5. Token 刷新

**云函数**: `auth`（路由分发）

**请求**
```http
POST /api/v1/auth/token-refresh
Cookie: 自动携带（withCredentials: true）
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
    "expire": 7200
  }
}
```

> **字段说明**：
> - Set-Cookie 下发新 access_token + refresh_token，refresh_token 轮换

### 6. 退出登录

**云函数**: `auth`（路由分发）

**请求**
```http
POST /api/v1/auth/logout
Cookie: 自动携带（withCredentials: true）
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {}
}
```

> **字段说明**：
> - 清除 Cookie

### 7. 后台登录

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/login
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
  "request_id": "uuid-v4",
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

### 8. 获取商品列表

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/goods/list
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": true
  }
}
```

### 9. 获取商品详情

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/goods/detail
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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

### 10. 创建订单

**云函数**: `order`（路由分发）

**请求**
```http
POST /api/v1/order/create
Cookie: 自动携带（withCredentials: true）
Content-Type: application/json

{
  "request_id": "uuid-v4",
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
> - `request_id`: 用于防重复提交，服务端 10s 内相同 request_id 去重

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
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

### 11. 订单预览

**云函数**: `order`（路由分发）

> **对应功能**：H5-ORDER-CONFIRM-003

**请求**
```http
POST /api/v1/order/preview
Cookie: 自动携带（withCredentials: true）
Content-Type: application/json

{
  "goods": [
    {
      "goods_id": "商品ID",
      "sku_id": "sku_001",
      "quantity": 2
    }
  ],
  "use_points": 0
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
    "original_amount": 5000,
    "discount_detail": {
      "drink_discount_amount": 100,
      "labor_discount_amount": 0,
      "parts_discount_amount": 0,
      "total_discount_amount": 100
    },
    "point_deduct": 0,
    "pay_amount": 4900,
    "goods_valid": true
  }
}
```

> **字段说明**：
> - 服务端计算最新价格/折扣/库存，前端仅展示

### 12. 发起支付

**云函数**: `order`（路由分发）

> **对应功能**：H5-PAY-004/005/006

**请求**
```http
POST /api/v1/order/pay
Cookie: 自动携带（withCredentials: true）
Content-Type: application/json

{
  "order_no": "202605211430001",
  "pay_method": "wechat",
  "env": "wechat"
}
```

> **参数说明**：
> - `pay_method` 可选：`wechat` / `alipay` / `balance`
> - `env` 可选：`wechat` / `browser`

**响应（微信内）**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
    "order_no": "202605211430001",
    "pay_method": "wechat",
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

**响应（外部浏览器）**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
    "order_no": "202605211430001",
    "pay_method": "wechat",
    "h5_url": "https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?..."
  }
}
```

**响应（余额支付）**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
    "order_no": "202605211430001",
    "pay_method": "balance",
    "pay_amount": 5000,
    "balance_before": 11000,
    "balance_after": 6000,
    "pay_time": "2026-05-21T14:35:00Z"
  }
}
```

### 13. 支付回调

**云函数**: `order`（路由分发）

**请求**
```http
POST /api/v1/order/pay-callback
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
  "request_id": "uuid-v4",
  "data": {
    "order_no": "202605211430001",
    "order_status": "paid",
    "pay_time": "2026-05-21T14:35:00Z"
  }
}
```

### 14. 支付状态长轮询

**云函数**: `order`（路由分发）

> **对应功能**：H5-PAY-007

**请求**
```http
POST /api/v1/order/pay-status
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
  "data": {
    "order_no": "202605211430001",
    "order_status": "paid",
    "pay_status": 1
  }
}
```

> **字段说明**：
> - 服务端 hold 5 秒后返回（有结果立即返回），减少 70% 请求量
> - `order_status`: pending/paid/making/completed/cancelled/refunded
> - `pay_status`: 0=待支付，1=已支付，2=已取消

### 15. 查询订单列表

**云函数**: `order`（路由分发）

**请求**
```http
POST /api/v1/order/list
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": false
  }
}
```

### 16. 查询订单详情

**云函数**: `order`（路由分发）

**请求**
```http
POST /api/v1/order/detail
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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

### 17. 申请退款（H5 端）

**云函数**: `order`（路由分发）

> **对应功能**：H5-ORDER-LIST-007

**请求**
```http
POST /api/v1/order/refund-request
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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
  "request_id": "uuid-v4",
  "data": null
}
```

> **字段说明**：
> - 仅 pending（待取餐）和 making（制作中）状态的订单可申请退款
> - `refund_status`: pending（待处理）/ approved（已退款）/ rejected（已驳回）
> - 退款完成后订单状态变为 cancelled，积分和成长值自动回退

### 18. 退款状态查询

**云函数**: `order`（路由分发）

> **对应功能**：ADM-ORDER-003

**请求**
```http
POST /api/v1/order/refund-status
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
  "data": {
    "order_no": "202605211430001",
    "refund_status": "approved",
    "refund_amount": 5000,
    "refund_time": "2026-05-21T15:10:00Z"
  }
}
```

### 19. 购物车同步

**云函数**: `order`（路由分发）

> **对应功能**：H5-CART-005

**请求**
```http
POST /api/v1/cart/sync
Cookie: 自动携带（withCredentials: true）
Content-Type: application/json

{
  "items": [
    {
      "goodsId": "商品ID",
      "skuId": "sku_001",
      "name": "美式咖啡",
      "price": 2500,
      "quantity": 2,
      "image": "url",
      "selected": true
    }
  ]
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
    "items": [
      {
        "goodsId": "商品ID",
        "skuId": "sku_001",
        "name": "美式咖啡",
        "price": 2500,
        "quantity": 3,
        "image": "url",
        "selected": true
      }
    ],
    "merged": true
  }
}
```

> **字段说明**：
> - 服务端异或合并后返回，相同商品+相同SKU数量相加

---

## 会员模块

### 20. 获取会员信息

**云函数**: `member`（路由分发）

**请求**
```http
POST /api/v1/members/info
Cookie: 自动携带（withCredentials: true）
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
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

### 21. 获取会员权益

**云函数**: `member`（路由分发）

**请求**
```http
POST /api/v1/members/benefits
Cookie: 自动携带（withCredentials: true）
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
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

### 22. 获取积分流水

**云函数**: `member`（路由分发）

**请求**
```http
POST /api/v1/members/point-logs
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": true
  }
}
```

### 23. 获取充值档位

**云函数**: `member`（路由分发）

**请求**
```http
POST /api/v1/members/recharge-tiers
Cookie: 自动携带（withCredentials: true）
Content-Type: application/json

{}
```

> **参数说明**：无额外参数（开业活动移至二期）

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
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

### 24. 发起充值

**云函数**: `member`（路由分发）

**请求**
```http
POST /api/v1/members/recharge
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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

### 25. H5 端余额支付

**云函数**: `member`（路由分发）

> **对应功能**：H5-PAY-004

**请求**
```http
POST /api/v1/members/balance/pay
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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
  "request_id": "uuid-v4",
  "data": null
}
```

> **字段说明**：
> - `balance_before`: 支付前余额（单位：分）
> - `balance_after`: 支付后余额（单位：分）
> - 扣款为原子操作，使用 `findOneAndUpdate` 带余额条件保证不超扣

### 26. 获取充值记录

**云函数**: `member`（路由分发）

**请求**
```http
POST /api/v1/members/recharge-logs
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": false
  }
}
```

### 27. 余额流水查询

**云函数**: `member`（路由分发）

> **对应功能**：H5-BALANCE-002~003

**请求**
```http
POST /api/v1/members/balance-logs
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": false
  }
}
```

> **字段说明**：
> - `change`: 变动金额（正数增加，负数减少，单位：分）
> - `after_balance`: 变动后余额（单位：分）
> - `type`: 变动类型（recharge/consume/refund/adjust）

---

## 收银模块

### 28. 店员创建订单

**云函数**: `cashier`（路由分发）

**请求**
```http
POST /api/v1/cashier/order-create
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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

### 29. 余额支付

**云函数**: `cashier`（路由分发）

**请求**
```http
POST /api/v1/cashier/balance-pay
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
  "data": {
    "order_no": "202605211430001",
    "pay_status": 1,
    "balance_after": 6000,
    "pay_time": "2026-05-21T14:35:00Z"
  }
}
```

### 30. 解析会员码

**云函数**: `cashier`（路由分发）

**请求**
```http
POST /api/v1/cashier/member-code-decode
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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

### 31. 创建帖子

**云函数**: `community-post`（路由分发）

**请求**
```http
POST /api/v1/community/post-create
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
  "data": {
    "post_id": "帖子ID",
    "create_time": "2026-05-21T10:00:00Z"
  }
}
```

### 32. 获取帖子列表

**云函数**: `community-post`（路由分发）

**请求**
```http
POST /api/v1/community/post-list
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": true
  }
}
```

### 33. 获取帖子详情

**云函数**: `community-post`（路由分发）

**请求**
```http
POST /api/v1/community/post-detail
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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

### 34. 点赞/取消点赞

**云函数**: `community-post`（路由分发）

**请求**
```http
POST /api/v1/community/post-like
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
  "data": {
    "post_id": "帖子ID",
    "is_liked": true,
    "likes": 16
  }
}
```

### 35. 发表评论

**云函数**: `community-comment`（路由分发）

**请求**
```http
POST /api/v1/community/comment-create
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
  "data": {
    "comment_id": "评论ID",
    "create_time": "2026-05-21T11:00:00Z"
  }
}
```

### 36. 获取评论列表

**云函数**: `community-comment`（路由分发）

**请求**
```http
POST /api/v1/community/comment-list
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": false
  }
}
```

### 37. 删除帖子

**云函数**: `community-post`（路由分发）

**请求**
```http
POST /api/v1/community/post-delete
Cookie: 自动携带（withCredentials: true）
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
  "request_id": "uuid-v4",
  "data": {
    "post_id": "帖子ID"
  }
}
```

---

## 后台管理模块

### 38. 获取商品列表（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/goods/list
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": true
  }
}
```

### 39. 保存商品

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/goods/save
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
  "request_id": "uuid-v4",
  "data": {
    "id": "商品ID"
  }
}
```

### 40. 获取订单列表（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/orders/list
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": true
  }
}
```

### 41. 更新订单状态

**云函数**: `admin`（路由分发）

> **对应功能**：ADM-ORDER-002

**请求**
```http
POST /api/v1/admin/orders/update
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
  "request_id": "uuid-v4",
  "data": {
    "order_no": "202605211430001",
    "order_status": "making",
    "update_time": "2026-05-21T14:40:00Z"
  }
}
```

> **状态流转规则**：
> - pending（待取餐）→ making（制作中）或 cancelled（已取消）
> - making（制作中）→ completed（已完成）
> - completed/cancelled 状态不可再变更
> - 退款状态下通过 `admin/refund/process` 单独处理

### 42. 获取会员列表

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/members/list
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": true
  }
}
```

### 43. 获取会员详情

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/members/detail
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
  "request_id": "uuid-v4",
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

### 44. 调整会员积分

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/members/point-adjust
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
  "request_id": "uuid-v4",
  "data": {
    "uid": "用户ID",
    "points_before": 1150,
    "points_after": 1250,
    "change": 100
  }
}
```

### 45. 余额调整（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/members/balance-adjust
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
  "request_id": "uuid-v4",
  "data": {
    "member_id": "用户ID",
    "balance_before": 10000,
    "balance_after": 15000,
    "adjust_amount": 5000
  }
}
```

### 46. 会员充值记录查询（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/members/recharge-logs
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": false
  }
}
```

### 47. 退款处理

**云函数**: `admin`（路由分发）

> **对应功能**：ADM-ORDER-003

**请求**
```http
POST /api/v1/admin/refund/process
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
  "request_id": "uuid-v4",
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
  "request_id": "uuid-v4",
  "data": null
}
```

> **处理逻辑**：
> - 仅 pending（待取餐）和 making（制作中）状态可退款
> - 微信支付：调用收钱吧退款 API 原路退回
> - 余额支付：退回余额账户
> - 退款后自动回退积分和成长值，恢复库存
> - 订单状态变为 `cancelled`

### 48. 等级权益配置查询（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/member-levels/list
Authorization: Bearer <admin_token>
Content-Type: application/json

{}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
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

### 49. 等级权益配置保存（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/member-levels/save
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
  "request_id": "uuid-v4",
  "data": {
    "level": 1,
    "update_time": "2026-05-21T10:00:00Z"
  }
}
```

### 50. 充值档位配置查询（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/recharge-tiers/list
Authorization: Bearer <admin_token>
Content-Type: application/json

{}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
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

### 51. 充值档位配置保存（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/recharge-tiers/save
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
  "request_id": "uuid-v4",
  "data": {
    "tier_id": 1,
    "update_time": "2026-05-21T10:00:00Z"
  }
}
```

### 52. 营业报表

**云函数**: `admin`（路由分发）

> **对应功能**：ADM-REPORT-001

**请求**
```http
POST /api/v1/admin/report/dashboard
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
  "request_id": "uuid-v4",
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

### 53. 商品销售排行

**云函数**: `admin`（路由分发）

> **对应功能**：ADM-REPORT-002

**请求**
```http
POST /api/v1/admin/report/goods-ranking
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
  "request_id": "uuid-v4",
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

### 54. 会员统计报表

**云函数**: `admin`（路由分发）

> **对应功能**：ADM-REPORT-003

**请求**
```http
POST /api/v1/admin/report/member-stats
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
  "request_id": "uuid-v4",
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

### 55. 操作日志查询

**云函数**: `admin`（路由分发）

> **对应功能**：ADM-LOG-001~002

**请求**
```http
POST /api/v1/admin/operation-logs
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": true
  }
}
```

### 56. 桌号列表查询

**云函数**: `admin`（路由分发）

> **对应功能**：ADM-TABLE-001

**请求**
```http
POST /api/v1/admin/table/list
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
  "request_id": "uuid-v4",
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
    "pageSize": 50,
    "has_more": false
  }
}
```

### 57. 桌号保存 & 生成桌台码

**云函数**: `admin`（路由分发）

> **对应功能**：ADM-TABLE-001~002

**请求**
```http
POST /api/v1/admin/table/save
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
  "request_id": "uuid-v4",
  "data": {
    "id": "桌号ID",
    "table_no": "A01",
    "qrcode_url": "https://cdn.example.com/qr/A01.png",
    "qrcode_content": "https://m.bikeclub.cn/?table=A01",
    "update_time": "2026-05-21T10:00:00Z"
  }
}
```

### 58. 帖子管理（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/community/posts
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
  "request_id": "uuid-v4",
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
    "pageSize": 20,
    "has_more": true
  }
}
```

### 59. 删除社区帖子（后台）

**云函数**: `admin`（路由分发）

**请求**
```http
POST /api/v1/admin/community/post-delete
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
  "request_id": "uuid-v4",
  "data": {
    "post_id": "帖子ID"
  }
}
```

---

## 微信模块

### 60. 微信 JSAPI 签名

**云函数**: `wx-jsapi-signature`（独立）

> **对应功能**：H5-WX-SDK-001

**请求**
```http
POST /api/v1/wx/jsapi-signature
Cookie: 自动携带（withCredentials: true）
Content-Type: application/json

{
  "url": "https://m.bikeclub.cn/pages/index/index"
}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "request_id": "uuid-v4",
  "data": {
    "appId": "wx1234567890",
    "timestamp": "1234567890",
    "nonceStr": "随机字符串",
    "signature": "sha1签名"
  }
}
```

---

## 接口汇总表

| 序号 | 接口路径 | 合并云函数 | 模块 | 说明 |
|:---:|:---|:---|:---|:---|
| 1 | POST /api/v1/auth/wx-login | auth | 认证 | 微信登录 |
| 2 | POST /api/v1/auth/phone-login | auth | 认证 | 手机号验证码登录 |
| 3 | POST /api/v1/auth/sms-code | auth | 认证 | 发送验证码 |
| 4 | POST /api/v1/auth/check-token | auth | 认证 | Token校验 |
| 5 | POST /api/v1/auth/token-refresh | auth | 认证 | Token刷新 |
| 6 | POST /api/v1/auth/logout | auth | 认证 | 退出登录 |
| 7 | POST /api/v1/admin/login | admin | 认证 | 后台登录 |
| 8 | POST /api/v1/goods/list | admin | 商品 | 商品列表 |
| 9 | POST /api/v1/goods/detail | admin | 商品 | 商品详情 |
| 10 | POST /api/v1/order/create | order | 订单 | 创建订单 |
| 11 | POST /api/v1/order/preview | order | 订单 | 订单预览 |
| 12 | POST /api/v1/order/pay | order | 订单 | 发起支付 |
| 13 | POST /api/v1/order/pay-callback | order | 订单 | 支付回调 |
| 14 | POST /api/v1/order/pay-status | order | 订单 | 支付状态长轮询 |
| 15 | POST /api/v1/order/list | order | 订单 | 订单列表 |
| 16 | POST /api/v1/order/detail | order | 订单 | 订单详情 |
| 17 | POST /api/v1/order/refund-request | order | 订单 | H5端申请退款 |
| 18 | POST /api/v1/order/refund-status | order | 订单 | 退款状态查询 |
| 19 | POST /api/v1/cart/sync | order | 订单 | 购物车同步 |
| 20 | POST /api/v1/members/info | member | 会员 | 会员信息 |
| 21 | POST /api/v1/members/benefits | member | 会员 | 会员权益 |
| 22 | POST /api/v1/members/point-logs | member | 会员 | 积分流水 |
| 23 | POST /api/v1/members/recharge-tiers | member | 会员 | 充值档位 |
| 24 | POST /api/v1/members/recharge | member | 会员 | 发起充值 |
| 25 | POST /api/v1/members/balance/pay | member | 会员 | H5端余额支付 |
| 26 | POST /api/v1/members/recharge-logs | member | 会员 | 充值记录 |
| 27 | POST /api/v1/members/balance-logs | member | 会员 | 余额流水查询 |
| 28 | POST /api/v1/cashier/order-create | cashier | 收银 | 店员下单 |
| 29 | POST /api/v1/cashier/balance-pay | cashier | 收银 | 收银端余额支付 |
| 30 | POST /api/v1/cashier/member-code-decode | cashier | 收银 | 解析会员码 |
| 31 | POST /api/v1/community/post-create | community-post | 社区 | 创建帖子 |
| 32 | POST /api/v1/community/post-list | community-post | 社区 | 帖子列表 |
| 33 | POST /api/v1/community/post-detail | community-post | 社区 | 帖子详情 |
| 34 | POST /api/v1/community/post-like | community-post | 社区 | 点赞/取消 |
| 35 | POST /api/v1/community/comment-create | community-comment | 社区 | 发表评论 |
| 36 | POST /api/v1/community/comment-list | community-comment | 社区 | 评论列表 |
| 37 | POST /api/v1/community/post-delete | community-post | 社区 | 删除帖子 |
| 38 | POST /api/v1/admin/goods/list | admin | 后台 | 商品列表 |
| 39 | POST /api/v1/admin/goods/save | admin | 后台 | 保存商品 |
| 40 | POST /api/v1/admin/orders/list | admin | 后台 | 订单列表 |
| 41 | POST /api/v1/admin/orders/update | admin | 后台 | 更新订单状态 |
| 42 | POST /api/v1/admin/members/list | admin | 后台 | 会员列表 |
| 43 | POST /api/v1/admin/members/detail | admin | 后台 | 会员详情 |
| 44 | POST /api/v1/admin/members/point-adjust | admin | 后台 | 积分调整 |
| 45 | POST /api/v1/admin/members/balance-adjust | admin | 后台 | 余额调整 |
| 46 | POST /api/v1/admin/members/recharge-logs | admin | 后台 | 会员充值记录 |
| 47 | POST /api/v1/admin/refund/process | admin | 后台 | 退款处理 |
| 48 | POST /api/v1/admin/member-levels/list | admin | 后台 | 等级权益配置查询 |
| 49 | POST /api/v1/admin/member-levels/save | admin | 后台 | 等级权益配置保存 |
| 50 | POST /api/v1/admin/recharge-tiers/list | admin | 后台 | 充值档位配置查询 |
| 51 | POST /api/v1/admin/recharge-tiers/save | admin | 后台 | 充值档位配置保存 |
| 52 | POST /api/v1/admin/report/dashboard | admin | 后台 | 营业报表 |
| 53 | POST /api/v1/admin/report/goods-ranking | admin | 后台 | 商品销售排行 |
| 54 | POST /api/v1/admin/report/member-stats | admin | 后台 | 会员统计报表 |
| 55 | POST /api/v1/admin/operation-logs | admin | 后台 | 操作日志查询 |
| 56 | POST /api/v1/admin/table/list | admin | 后台 | 桌号列表查询 |
| 57 | POST /api/v1/admin/table/save | admin | 后台 | 桌号保存&桌台码 |
| 58 | POST /api/v1/admin/community/posts | admin | 后台 | 帖子管理 |
| 59 | POST /api/v1/admin/community/post-delete | admin | 后台 | 删除帖子 |
| 60 | POST /api/v1/wx/jsapi-signature | wx-jsapi-signature | 微信 | JSAPI签名 |

---

*文档结束*
