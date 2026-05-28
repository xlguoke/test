# Checklist: 服务端 API/云函数（uniCloud）

> 验收标准：每个检查项必须通过接口测试、数据库验证、代码审查三重确认

---

## 5.1 工程初始化

- [ ] uniCloud 服务空间配置正确（阿里云版）
- [ ] manifest.json 配置完整
- [ ] 云函数目录结构清晰（common/goods/order/member/admin/payment/timed）
- [ ] 云函数可在本地运行和上传

## 5.2 数据库

- [ ] 10 个集合全部创建
- [ ] 索引配置正确（唯一索引、普通索引）
- [ ] 初始数据导入完成（member_levels、admin_users、activities）
- [ ] dbService 封装可用（find/findOne/insert/update/delete/findOneAndUpdate）

## 5.3 认证模块

- [ ] wx-auth：接收 code，返回 openid，创建会员，生成 JWT
- [ ] check-token：解析 JWT，返回用户信息或 10002
- [ ] admin-login：bcrypt 校验密码，生成 JWT（24h）
- [ ] JWT secret 存储在环境变量
- [ ] 错误码正确：10001（code 无效）、10002（Token 过期）、10003（账号密码错误）

## 5.4 商品模块

- [ ] goods-list：支持分类/关键词/标签筛选，只返回 status=1
- [ ] goods-detail：返回商品 + SKU 列表
- [ ] admin-goods-list：JWT 校验，支持全部状态
- [ ] admin-goods-save：事务处理，保存商品 + SKU
- [ ] 返回结构与 api-contracts.md 一致

## 5.5 订单模块

- [ ] order-create：库存校验、折扣计算、积分抵扣、生成订单号、调用支付
- [ ] order-pay-callback：签名验证、幂等处理、更新状态、发放积分
- [ ] order-list：支持状态筛选，分页
- [ ] order-detail：返回完整订单信息
- [ ] admin-orders-list：支持多条件筛选
- [ ] admin-order-update：校验状态流转合法性
- [ ] 状态流转：待付款→已支付→制作中→已完成，已取消为终态

## 5.6 会员模块

- [ ] member-info：返回会员信息 + 等级配置 + 升级进度
- [ ] member-benefits：返回全部 7 个等级配置
- [ ] member-point-logs：支持类型筛选，分页
- [ ] member-recharge-tiers：平时 5 档 + 活动 4 档
- [ ] member-recharge：创建充值记录，调用支付
- [ ] member-recharge-callback：更新余额、积分、等级
- [ ] member-recharge-logs：分页返回
- [ ] member-point-calculate：计算可用积分上限（30%）

## 5.7 后台管理模块

- [ ] admin-members-list：支持昵称/手机号/等级筛选
- [ ] admin-members-detail：返回会员 + 最近订单 + 最近积分
- [ ] admin-point-adjust：原子更新积分，写入 point_logs
- [ ] 权限控制：super 全部权限，admin 仅查看

## 5.8 支付联调

- [ ] 收钱吧沙箱环境配置完成
- [ ] 统一下单返回 jsapi_params
- [ ] 支付回调验证签名通过
- [ ] 幂等处理生效（重复回调不重复发放积分）
- [ ] 充值回调更新余额和积分正确
- [ ] 沙箱支付全流程走通

## 5.9 定时任务

- [ ] 积分过期清理：每日凌晨 2:00 执行
- [ ] 订单超时取消：每 30 分钟执行
- [ ] 会员等级检查：充值回调后触发
- [ ] 定时触发器配置正确

## 5.10 部署

- [ ] 云函数 URL 化配置完成
- [ ] CORS 配置正确
- [ ] 全部云函数部署成功
- [ ] HTTP 调用全部接口正常

---

## 验收通过标准

| 检查项 | 通过标准 |
|:---|:---|
| 接口完整性 | 全部 25+ 个云函数实现并部署 |
| 数据一致性 | 接口返回结构与 api-contracts.md 完全一致 |
| 支付安全 | 签名验证、幂等处理、状态流转全部正确 |
| 权限控制 | JWT 校验生效，角色权限区分正确 |
| 定时任务 | 按计划执行，无遗漏 |
| 性能 | 接口响应时间 < 500ms（不含支付接口） |
