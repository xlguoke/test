# Spec: 联调与部署

## Goal
完成前后端联调，将 Mock 数据切换为真实 API，进行端到端测试、异常场景验证、性能优化，最终部署上线。

## Done Contract
- 完成标准：全流程端到端测试通过，性能达标，已部署到生产环境
- 证明方式：生产环境完成：微信授权登录 → 浏览商品 → 下单支付 → 查看订单 → 后台管理订单
- 未完成标准：接口不通、支付失败、性能不达标

## Scope
- **In**：Mock 切换、端到端联调、异常场景、性能优化、部署上线
- **Out**：新功能开发（在各自独立 spec 中）

## Facts / Constraints
- **产品基准**：`full-feature-list.md` v3.0（一期全量功能点）
- H5 部署：uniCloud 前端托管
- Admin 部署：uniCloud 前端托管（或独立服务器）
- 服务端：uniCloud 云函数（已部署）
- 域名：需配置公众号域名授权
- 支付：收钱吧生产环境

---

## 阶段详细规范

### 1. Mock 切换真实 API

#### 1.1 环境变量配置
- 创建 `.env.development` 和 `.env.production`
- `VITE_USE_MOCK=false`（生产环境）
- `VITE_API_BASE_URL=https://xxx.aliyuncs.com/api`（云函数 URL 化地址）

#### 1.2 请求基地址切换
- 修改 `packages/shared/src/utils/request.ts`
- 根据环境变量切换 Mock/真实 API
- 保留 Mock 开关，便于本地调试

#### 1.3 接口验证
- 逐一验证全部 API 调用正常
- 对比 Mock 和真实 API 返回结构
- 处理字段差异

---

### 2. 端到端联调

#### 2.1 认证链路
- 微信授权 → 获取 code → 调用 wx-auth → 获取 Token → 页面访问
- Token 过期自动跳转登录页
- 后台管理登录 → Token 存储 → 接口调用

#### 2.2 点单支付链路
- 浏览商品 → 加购 → 下单 → 支付 → 回调 → 积分发放
- 验证订单状态流转正确
- 验证积分发放准确

#### 2.3 会员模块联调
- 充值 → 支付回调 → 余额更新 → 等级检查
- 积分抵扣 → 订单完成 → 积分变动
- 积分过期 → 定时任务清理

#### 2.4 后台管理联调
- 商品上架/下架 → H5 端显示/隐藏
- 订单状态更新 → H5 端状态同步
- 积分调整 → 会员积分实时更新

---

### 3. 异常场景验证

#### 3.1 支付超时
- 下单后 30 分钟未支付
- 验证订单自动取消
- 验证库存恢复

#### 3.2 Token 过期
- 等待 Token 过期（7 天）或手动修改 Token
- 验证自动跳转登录页
- 验证登录后返回原页面

#### 3.3 库存不足
- 下单时库存不足
- 验证正确提示 "库存不足"
- 验证订单未创建

#### 3.4 余额不足
- 余额支付时余额不足
- 验证正确提示 "余额不足"
- 验证订单未扣款

#### 3.5 网络异常
- 断网后恢复
- 验证页面自动重试
- 验证数据一致性

---

### 4. 性能优化

#### 4.1 首屏加载
- 目标：< 3 秒
- 代码分割（route-based）
- 图片懒加载
- 组件按需加载

#### 4.2 图片优化
- 压缩商品图片
- CDN 加速
- 懒加载（仅可视区域加载）

#### 4.3 API 优化
- 接口响应时间 < 500ms
- 数据库查询优化（索引命中）
- 缓存热点数据（Banner、商品列表）

#### 4.4 打包优化
- Tree Shaking
- Gzip 压缩
- 静态资源 CDN

---

### 5. 部署上线

#### 5.1 H5 端部署
- 打包：`pnpm --filter @lingqi/app build:h5`
- 上传 uniCloud 前端托管
- 配置自定义域名

#### 5.2 Admin 端部署
- 打包：`pnpm --filter @lingqi/admin build`
- 上传 uniCloud 前端托管
- 配置 path rewrite（/admin/* → /admin/index.html）

#### 5.3 服务端部署
- 云函数已全部部署（Phase 3）
- 验证云函数 URL 化地址

#### 5.4 域名配置
- 公众号 JS 安全域名
- 授权回调域名
- 收钱吧回调 URL

#### 5.5 生产环境验证
- 全流程走通（登录 → 点单 → 支付 → 查看订单）
- 后台管理验证
- 支付回调验证

---

## ADDED Requirements

### Requirement: 平滑切换
The system SHALL support smooth transition from Mock to real API without code changes.

#### Scenario: 切换环境
- **GIVEN** 修改环境变量 VITE_USE_MOCK=false
- **WHEN** 重启应用
- **THEN** 自动切换为真实 API

### Requirement: 异常恢复
The system SHALL handle network errors gracefully with auto-retry.

#### Scenario: 网络恢复
- **GIVEN** 网络断开后恢复
- **WHEN** 页面自动重试
- **THEN** 数据加载成功，无重复提交

## MODIFIED Requirements
无

## REMOVED Requirements
无

## Change Log
- 2026-05-23: 初始版本
