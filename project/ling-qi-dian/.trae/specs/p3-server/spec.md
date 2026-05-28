# Spec: 服务端 API/云函数（uniCloud）

## Goal
实现机车俱乐部服务端全部云函数 API，基于 uniCloud 阿里云版。包含数据库设计、认证模块、商品模块、订单模块、会员模块、后台管理模块、支付联调、定时任务。所有接口遵循 api-contracts.md 的 Req/Res 结构。

## Done Contract
- 完成标准：全部云函数部署成功，接口返回结构与 api-contracts.md 一致，支付联调通过
- 证明方式：使用 Postman/Apifox 调用全部接口，验证返回结构；收钱吧沙箱支付走通
- 未完成标准：接口返回结构不一致、支付回调失败、数据库索引缺失

## Scope
- **In**: 数据库集合、云函数 API、支付对接、定时任务
- **Out**: H5 前端、后台管理前端（在各自独立 spec 中）

## Facts / Constraints
- **产品基准**：`full-feature-list.md` v3.0 全文 + `api-contracts.md` v2.1（51 个接口）+ `db-schema.md` v2.1（14 个集合）+ `member-system-design.md` v6.0（会员业务规则）
- 平台：uniCloud 阿里云版
- 数据库：MongoDB（uniCloud 云数据库）
- 认证：自定义 JWT（非 uni-id）
- 支付：收钱吧 JSAPI 支付
- 部署：云函数 URL 化
- 安全：JWT 验证、参数校验、NoSQL 注入防护
- **设计契约文件**（本 Spec 的字段定义、接口结构唯一来源，云函数实现必须严格遵循）：
  - 接口字段 → [api-contracts.md](../../../mydocs/api-contracts.md) 全文（51 个接口，含 Req/Res 结构、错误码、全局约定）
  - 数据库结构 → [db-schema.md](../../../mydocs/db-schema.md) 全文（14 个集合的字段定义、索引配置）
  - 会员业务规则 → [member-system-design.md](../../../mydocs/member-system-design.md) 全文（等级计算、充值 1:1:1 模型、积分规则、折扣计算）

---

## 数据库设计

### 集合列表
1. **members**：会员信息
2. **member_levels**：会员等级配置
3. **point_logs**：积分变动记录
4. **recharge_logs**：充值记录
5. **orders**：订单
6. **goods**：商品
7. **goods_skus**：商品 SKU
8. **admin_users**：后台管理员
9. **banners**：Banner 轮播
10. **activities**：活动配置

### 索引配置
- members：openid（唯一）、phone（唯一）、level、created_at
- orders：order_no（唯一）、member_id、status、created_at
- goods：category、status、created_at
- point_logs：member_id、reason_code、created_at
- recharge_logs：member_id、status、created_at

---

## 云函数详细规范

### 1. 认证模块

#### 1.1 wx-auth（微信授权登录）
- **路径**：`/wx-auth`
- **方法**：POST
- **参数**：`{ code: string }`
- **逻辑**：
  1. 接收微信 code
  2. 调用微信接口获取 openid
  3. 根据 openid 查询 members
  4. 不存在则创建新会员（level=0, points=0, balance=0）
  5. 生成 JWT Token（有效期 7 天）
  6. 返回：`{ token, member: { id, nickname, avatar, level } }`
- **错误码**：
  - 10001：code 无效
  - 10005：微信接口失败

#### 1.2 check-token（Token 校验）
- **路径**：`/check-token`
- **方法**：POST
- **参数**：`{ token: string }`
- **逻辑**：
  1. 解析 JWT Token
  2. Token 过期返回 10002
  3. 返回用户基本信息

#### 1.3 admin-login（后台登录）
- **路径**：`/admin-login`
- **方法**：POST
- **参数**：`{ username: string, password: string }`
- **逻辑**：
  1. 查询 admin_users
  2. bcrypt 校验密码
  3. 生成 JWT Token（有效期 24 小时）
  4. 返回：`{ token, user: { id, username, nickname, role } }`
- **错误码**：
  - 10003：账号或密码错误

---

### 2. 商品模块

#### 2.1 goods-list（商品列表）
- **路径**：`/goods-list`
- **方法**：GET
- **参数**：`{ category?: string, keyword?: string, tag?: string, page: number, pageSize: number }`
- **逻辑**：
  1. 构建查询条件（status=1）
  2. 支持分类筛选、关键词搜索（名称模糊匹配）、标签筛选
  3. 分页返回
  4. 返回：`{ list: GoodsItem[], total: number, page, pageSize }`

#### 2.2 goods-detail（商品详情）
- **路径**：`/goods-detail`
- **方法**：GET
- **参数**：`{ goods_id: string }`
- **逻辑**：
  1. 查询 goods 集合
  2. 关联查询 goods_skus
  3. 返回完整商品信息 + SKU 列表

#### 2.3 admin-goods-list（后台商品列表）
- **路径**：`/admin-goods-list`
- **方法**：GET
- **参数**：`{ keyword?: string, category?: string, status?: number, page: number, pageSize: number }`
- **逻辑**：
  1. JWT 校验（仅 super/admin）
  2. 构建查询条件（支持全部状态）
  3. 返回价格区间、库存汇总

#### 2.4 admin-goods-save（保存商品）
- **路径**：`/admin-goods-save`
- **方法**：POST
- **参数**：`{ id?: string, name, category, description, images, tags, status, skus: SkuItem[] }`
- **逻辑**：
  1. JWT 校验（仅 super）
  2. 表单校验
  3. 事务：保存商品 + 删除旧 SKU + 保存新 SKU
  4. 返回保存后的商品 ID

---

### 3. 订单模块

#### 3.1 order-create（创建订单）
- **路径**：`/order-create`
- **方法**：POST
- **参数**：`{ goods: OrderGoodsItem[], table_no?, remark?, use_points?: boolean, points?: number }`
- **逻辑**：
  1. JWT 校验
  2. 校验库存（原子扣减）
  3. 查询会员等级，计算分品类折扣
  4. 计算积分抵扣（30% 上限）
  5. 生成订单号（时间戳+随机数）
  6. 创建 orders 记录
  7. 扣减积分（如使用）
  8. 调用收钱吧统一下单
  9. 返回支付参数：`{ order_no, jsapi_params }`

#### 3.2 order-pay-callback（支付回调）
- **路径**：`/order-pay-callback`
- **方法**：POST
- **参数**：收钱吧回调参数
- **逻辑**：
  1. 验证收钱吧签名
  2. 幂等处理（根据订单号去重）
  3. 更新订单状态为已支付
  4. 发放消费积分（1 元=1 积分）
  5. 写入 point_logs
  6. 返回成功响应

#### 3.3 order-list（订单列表）
- **路径**：`/order-list`
- **方法**：GET
- **参数**：`{ status?: number, page: number, pageSize: number }`
- **逻辑**：
  1. JWT 校验
  2. 根据 member_id 查询
  3. 支持状态筛选
  4. 分页返回

#### 3.4 order-detail（订单详情）
- **路径**：`/order-detail`
- **方法**：GET
- **参数**：`{ order_no: string }`
- **逻辑**：
  1. JWT 校验
  2. 查询订单详情
  3. 校验订单归属

#### 3.5 admin-orders-list（后台订单列表）
- **路径**：`/admin-orders-list`
- **方法**：GET
- **参数**：`{ order_no?: string, status?: number, start_time?, end_time?, page, pageSize }`
- **逻辑**：
  1. JWT 校验（仅 super/admin）
  2. 支持订单号、状态、时间范围筛选
  3. 分页返回

#### 3.6 admin-order-update（更新订单状态）
- **路径**：`/admin-order-update`
- **方法**：POST
- **参数**：`{ order_no: string, status: number }`
- **逻辑**：
  1. JWT 校验（仅 super/admin）
  2. 校验状态流转合法性
  3. 更新订单状态

---

### 4. 会员模块

#### 4.1 member-info（会员信息）
- **路径**：`/member-info`
- **方法**：GET
- **参数**：无（从 Token 解析）
- **逻辑**：
  1. JWT 校验
  2. 查询 members
  3. 查询 member_levels 获取当前等级配置
  4. 计算 next_level_amount
  5. 返回：`{ member, level_config, next_level }`

#### 4.2 member-benefits（会员权益）
- **路径**：`/member-benefits`
- **方法**：GET
- **参数**：无
- **逻辑**：
  1. JWT 校验
  2. 查询 member_levels 全部配置
  3. 返回：`{ current_level, all_levels }`

#### 4.3 member-point-logs（积分明细）
- **路径**：`/member-point-logs`
- **方法**：GET
- **参数**：`{ type?: string, page, pageSize }`
- **逻辑**：
  1. JWT 校验
  2. 根据 member_id 查询 point_logs
  3. 支持类型筛选（income/expend）
  4. 分页返回

#### 4.4 member-recharge-tiers（充值档位）
- **路径**：`/member-recharge-tiers`
- **方法**：GET
- **参数**：无
- **逻辑**：
  1. 查询 activities 获取当前活动配置
  2. 根据 is_opening_activity 返回不同档位
  3. 平时返回 5 档，活动期返回 4 档

#### 4.5 member-recharge（创建充值订单）
- **路径**：`/member-recharge`
- **方法**：POST
- **参数**：`{ tier_id: string }`
- **逻辑**：
  1. JWT 校验
  2. 校验档位 ID 合法性
  3. 创建 recharge_logs 记录
  4. 调用收钱吧统一下单
  5. 返回支付参数

#### 4.6 member-recharge-callback（充值回调）
- **路径**：`/member-recharge-callback`
- **方法**：POST
- **参数**：收钱吧回调参数
- **逻辑**：
  1. 验证签名
  2. 幂等处理
  3. 更新 recharge_logs 状态
  4. 增加会员余额
  5. 增加会员积分
  6. 检查并更新会员等级
  7. 写入 point_logs

#### 4.7 member-recharge-logs（充值记录）
- **路径**：`/member-recharge-logs`
- **方法**：GET
- **参数**：`{ page, pageSize }`
- **逻辑**：
  1. JWT 校验
  2. 根据 member_id 查询 recharge_logs
  3. 分页返回

#### 4.8 member-point-calculate（积分计算）
- **路径**：`/member-point-calculate`
- **方法**：POST
- **参数**：`{ order_amount: number }`
- **逻辑**：
  1. JWT 校验
  2. 查询会员可用积分
  3. 计算可抵扣上限（order_amount * 30%）
  4. 返回：`{ available_points, deduction_amount }`

---

### 5. 后台管理模块

#### 5.1 admin-members-list（后台会员列表）
- **路径**：`/admin-members-list`
- **方法**：GET
- **参数**：`{ nickname?, phone?, level?, page, pageSize }`
- **逻辑**：
  1. JWT 校验（仅 super/admin）
  2. 支持昵称、手机号、等级筛选
  3. 分页排序

#### 5.2 admin-members-detail（会员详情）
- **路径**：`/admin-members-detail`
- **方法**：GET
- **参数**：`{ member_id: string }`
- **逻辑**：
  1. JWT 校验
  2. 查询会员信息
  3. 查询最近 5 条订单
  4. 查询最近 5 条积分变动

#### 5.3 admin-point-adjust（积分调整）
- **路径**：`/admin-point-adjust`
- **方法**：POST
- **参数**：`{ member_id: string, adjust_value: number, reason: string }`
- **逻辑**：
  1. JWT 校验（仅 super）
  2. 校验调整值
  3. 原子更新积分
  4. 写入 point_logs（reason_code="manual_adjust"）

---

### 6. 支付联调

#### 6.1 收钱吧配置
- 注册测试商户
- 获取测试密钥
- 配置回调 URL

#### 6.2 统一下单
- 云函数调用收钱吧接口
- 获取 jsapi_params
- 返回给前端调起支付

#### 6.3 回调处理
- 验证签名
- 幂等处理
- 更新订单/充值状态
- 发放积分/更新余额

---

### 7. 定时任务

#### 7.1 积分过期清理
- **触发**：每日凌晨 2:00
- **逻辑**：
  1. 查询 point_logs 中 expire_time < 当前时间的记录
  2. 扣减会员积分
  3. 写入过期记录

#### 7.2 订单超时取消
- **触发**：每 30 分钟
- **逻辑**：
  1. 查询 status=0（待付款）且创建时间 > 30 分钟的订单
  2. 更新状态为已取消（status=4）
  3. 恢复库存

#### 7.3 会员等级检查
- **触发**：充值回调后
- **逻辑**：
  1. 查询会员累计充值金额
  2. 对比 member_levels 升级门槛
  3. 如达到升级条件，更新会员等级

---

## ADDED Requirements

### Requirement: JWT 认证
The system SHALL provide custom JWT authentication with proper token validation.

#### Scenario: Token 过期
- **GIVEN** 用户 Token 已过期
- **WHEN** 访问需要认证的接口
- **THEN** 返回 10002 Token 过期错误

### Requirement: 支付安全
The system SHALL verify payment callbacks with signature validation and idempotency.

#### Scenario: 重复回调
- **GIVEN** 收钱吧重复发送回调
- **WHEN** 收到第二次回调
- **THEN** 幂等处理，不重复发放积分

## MODIFIED Requirements
无

## REMOVED Requirements
无

## Change Log
- 2026-05-23: 初始版本，基于 api-contracts.md 和 db-schema.md 制定
