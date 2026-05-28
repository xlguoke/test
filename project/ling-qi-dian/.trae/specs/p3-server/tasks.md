# Tasks: 服务端 API/云函数（uniCloud）

> 任务粒度：单个云函数或单个数据库集合级别，每个任务 ≤ 0.5 人日
> 依赖前提：Phase 0 主题引擎已完成，前端 specs 已完成（明确接口需求）

---

## Task 5.1: uniCloud 工程初始化

- [ ] **5.1.1** 创建 uniCloud 服务空间配置
  - 阿里云版服务空间
  - 生产环境 + 测试环境
- [ ] **5.1.2** 配置 `manifest.json`
  - 云函数根目录
  - 阿里云配置
- [ ] **5.1.3** 创建云函数目录结构
  - `uniCloud/cloudfunctions/common/`：公共模块
  - `uniCloud/cloudfunctions/goods/`：商品模块
  - `uniCloud/cloudfunctions/order/`：订单模块
  - `uniCloud/cloudfunctions/member/`：会员模块
  - `uniCloud/cloudfunctions/admin/`：后台管理模块
  - `uniCloud/cloudfunctions/payment/`：支付模块
- [ ] **5.1.4** 验证：云函数可在本地运行和上传

## Task 5.2: 数据库初始化

- [ ] **5.2.1** 创建数据库集合
  - `db.collection('members')`
  - `db.collection('member_levels')`
  - `db.collection('point_logs')`
  - `db.collection('recharge_logs')`
  - `db.collection('orders')`
  - `db.collection('goods')`
  - `db.collection('goods_skus')`
  - `db.collection('admin_users')`
  - `db.collection('banners')`
  - `db.collection('activities')`
- [ ] **5.2.2** 配置索引
  - members：openid（唯一）、phone（唯一）、level、created_at
  - orders：order_no（唯一）、member_id、status、created_at
  - goods：category、status、created_at
  - point_logs：member_id、reason_code、created_at
  - recharge_logs：member_id、status、created_at
- [ ] **5.2.3** 导入初始数据
  - member_levels：7 条等级配置
  - admin_users：初始 super 账号
  - activities：开业活动配置
- [ ] **5.2.4** 创建 dbService 封装
  - `find(collection, where, page, pageSize)`
  - `findOne(collection, where)`
  - `insert(collection, data)`
  - `update(collection, where, data)`
  - `delete(collection, where)`
  - `findOneAndUpdate(collection, where, data)`

## Task 5.3: 认证模块云函数

- [ ] **5.3.1** 创建 `uniCloud/cloudfunctions/auth/wx-auth/index.js`
  - 接收 code，调用微信接口获取 openid
  - 查询/创建 members
  - 生成 JWT Token（有效期 7 天）
  - 返回 token 和用户信息
- [ ] **5.3.2** 创建 `uniCloud/cloudfunctions/auth/check-token/index.js`
  - 解析 JWT Token
  - 返回用户基本信息或 10002 错误
- [ ] **5.3.3** 创建 `uniCloud/cloudfunctions/auth/admin-login/index.js`
  - 查询 admin_users
  - bcrypt 校验密码
  - 生成 JWT Token（有效期 24 小时）
  - 返回 token 和用户信息
- [ ] **5.3.4** 创建 JWT 工具模块
  - `jwt.sign(payload, secret, expiresIn)`
  - `jwt.verify(token, secret)`
  - secret 存储在环境变量
- [ ] **5.3.5** 验证：三个认证接口返回结构与 api-contracts.md 一致

## Task 5.4: 商品模块云函数

- [ ] **5.4.1** 创建 `uniCloud/cloudfunctions/goods/goods-list/index.js`
  - 支持分类/关键词/标签筛选
  - 只返回 status=1 的商品
  - 分页返回
- [ ] **5.4.2** 创建 `uniCloud/cloudfunctions/goods/goods-detail/index.js`
  - 根据 goods_id 查询
  - 关联查询 goods_skus
- [ ] **5.4.3** 创建 `uniCloud/cloudfunctions/goods/admin-goods-list/index.js`
  - JWT 校验（super/admin）
  - 支持全部状态筛选
  - 返回价格区间和库存汇总
- [ ] **5.4.4** 创建 `uniCloud/cloudfunctions/goods/admin-goods-save/index.js`
  - JWT 校验（super）
  - 表单校验
  - 事务：保存商品 + 删除旧 SKU + 保存新 SKU
- [ ] **5.4.5** 验证：商品接口返回结构正确

## Task 5.5: 订单模块云函数

- [ ] **5.5.1** 创建 `uniCloud/cloudfunctions/order/order-create/index.js`
  - JWT 校验
  - 校验库存（原子扣减）
  - 计算分品类折扣
  - 计算积分抵扣（30% 上限）
  - 生成订单号
  - 创建订单记录
  - 调用收钱吧统一下单
- [ ] **5.5.2** 创建 `uniCloud/cloudfunctions/order/order-pay-callback/index.js`
  - 验证收钱吧签名
  - 幂等处理
  - 更新订单状态
  - 发放消费积分
  - 写入 point_logs
- [ ] **5.5.3** 创建 `uniCloud/cloudfunctions/order/order-list/index.js`
  - JWT 校验
  - 根据 member_id 查询
  - 支持状态筛选
- [ ] **5.5.4** 创建 `uniCloud/cloudfunctions/order/order-detail/index.js`
  - JWT 校验
  - 查询订单详情
  - 校验订单归属
- [ ] **5.5.5** 创建 `uniCloud/cloudfunctions/order/admin-orders-list/index.js`
  - JWT 校验（super/admin）
  - 支持多条件筛选
- [ ] **5.5.6** 创建 `uniCloud/cloudfunctions/order/admin-order-update/index.js`
  - JWT 校验（super/admin）
  - 校验状态流转合法性
  - 更新订单状态
- [ ] **5.5.7** 验证：订单接口返回结构正确，状态流转合法

## Task 5.6: 会员模块云函数

- [ ] **5.6.1** 创建 `uniCloud/cloudfunctions/member/member-info/index.js`
  - JWT 校验
  - 查询会员信息和等级配置
  - 计算升级进度
- [ ] **5.6.2** 创建 `uniCloud/cloudfunctions/member/member-benefits/index.js`
  - JWT 校验
  - 返回全部等级配置
- [ ] **5.6.3** 创建 `uniCloud/cloudfunctions/member/member-point-logs/index.js`
  - JWT 校验
  - 支持类型筛选
  - 分页返回
- [ ] **5.6.4** 创建 `uniCloud/cloudfunctions/member/member-recharge-tiers/index.js`
  - 查询活动配置
  - 返回对应档位
- [ ] **5.6.5** 创建 `uniCloud/cloudfunctions/member/member-recharge/index.js`
  - JWT 校验
  - 校验档位
  - 创建充值记录
  - 调用收钱吧统一下单
- [ ] **5.6.6** 创建 `uniCloud/cloudfunctions/member/member-recharge-callback/index.js`
  - 验证签名
  - 幂等处理
  - 更新余额和积分
  - 检查并更新等级
- [ ] **5.6.7** 创建 `uniCloud/cloudfunctions/member/member-recharge-logs/index.js`
  - JWT 校验
  - 分页返回充值记录
- [ ] **5.6.8** 创建 `uniCloud/cloudfunctions/member/member-point-calculate/index.js`
  - JWT 校验
  - 计算可用积分上限
- [ ] **5.6.9** 验证：会员接口返回结构正确，等级计算准确

## Task 5.7: 后台管理模块云函数

- [ ] **5.7.1** 创建 `uniCloud/cloudfunctions/admin/admin-members-list/index.js`
  - JWT 校验（super/admin）
  - 支持多条件筛选
  - 分页排序
- [ ] **5.7.2** 创建 `uniCloud/cloudfunctions/admin/admin-members-detail/index.js`
  - JWT 校验
  - 返回会员详情 + 最近订单 + 最近积分
- [ ] **5.7.3** 创建 `uniCloud/cloudfunctions/admin/admin-point-adjust/index.js`
  - JWT 校验（super）
  - 原子更新积分
  - 写入 point_logs
- [ ] **5.7.4** 验证：后台接口权限控制生效

## Task 5.8: 支付联调

- [ ] **5.8.1** 收钱吧沙箱环境配置
  - 注册测试商户
  - 获取测试密钥
  - 配置回调 URL
- [ ] **5.8.2** 统一下单联调
  - 云函数调用收钱吧接口
  - 获取 jsapi_params
  - 验证返回参数
- [ ] **5.8.3** 支付回调联调
  - 配置回调 URL
  - 验证签名逻辑
  - 处理回调数据
- [ ] **5.8.4** 充值支付联调
  - 充值档位 → 统一下单 → 回调 → 余额/积分更新
- [ ] **5.8.5** 验证：沙箱支付全流程走通

## Task 5.9: 定时任务

- [ ] **5.9.1** 创建 `uniCloud/cloudfunctions/timed/point-expire/index.js`
  - 每日凌晨 2:00 执行
  - 清理过期积分
- [ ] **5.9.2** 创建 `uniCloud/cloudfunctions/timed/order-timeout/index.js`
  - 每 30 分钟执行
  - 取消超时未支付订单
  - 恢复库存
- [ ] **5.9.3** 创建 `uniCloud/cloudfunctions/timed/level-check/index.js`
  - 充值回调后触发
  - 检查并更新会员等级
- [ ] **5.9.4** 配置定时触发器
  - 在 uniCloud 控制台配置触发时间
- [ ] **5.9.5** 验证：定时任务按计划执行

## Task 5.10: 云函数 URL 化与部署

- [ ] **5.10.1** 配置云函数 URL 化
  - 每个云函数配置 HTTP 触发路径
  - 统一前缀 `/api/`
- [ ] **5.10.2** 配置 CORS
  - 允许 H5 域名和 Admin 域名访问
- [ ] **5.10.3** 部署全部云函数
  - 上传并发布
- [ ] **5.10.4** 验证：通过 HTTP 调用全部接口正常

---

> **依赖关系**：5.1 → 5.2 → 5.3 → 5.4/5.5/5.6（并行）→ 5.7 → 5.8 → 5.9 → 5.10
> **预计工期**：8-10 天
