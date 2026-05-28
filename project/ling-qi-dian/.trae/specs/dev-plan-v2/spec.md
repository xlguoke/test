# Spec: 机车俱乐部饮品与社区系统 — 开发计划 v2.0

## Goal
基于 `full-feature-list.md` 重新制定一份可执行、最小粒度、逻辑闭环的开发计划。计划需覆盖 H5 点单端、后台管理端、服务端云函数三大模块，并严格遵循"前置准备 → H5 前端 → 后台管理前端 → 服务端 API"的执行顺序。

## Done Contract
- 完成标准：输出 spec.md + tasks.md + checklist.md，任务粒度细化到单个文件/函数级别
- 证明方式：文档可直接指导编码，每个任务有明确的输入、输出、验收标准
- 未完成标准：任务描述模糊、无法直接执行、缺少验收标准

## Scope
- **In**: H5 前端（uni-app Vue3）、后台管理前端（vben-admin Vue3）、服务端云函数（uniCloud Node.js）、Mock 数据层、API 契约
- **Out**: 社区模块（二期开发）、店员收银（二期开发）、独立社区项目（web-community）

## Facts / Constraints
- **产品基准**：`full-feature-list.md` v3.0（全量目标）+ `api-contracts.md` v2.1（51 个接口）+ `db-schema.md` v2.1（14 个集合）+ `member-system-design.md` v6.0（会员体系）
- 技术栈：uni-app Vue3 + Vant UI（H5）、vben-admin Vue3（后台）、uniCloud 阿里云版（服务端）、收钱吧 JSAPI 支付
- 设计稿：`mydocs/design/` 目录下 4 张设计图（首页、会员、订单、商品）
- 设计稿主色：青绿色 #4ECDC4（与 p0-theme-engine spec 一致，废弃早期 #3B82F6 蓝色方案）
- 二期功能：社区-动态广场、社区-发帖、社区-帖子详情、店员收银、社区管理
- 认证方式：自定义 JWT（非 uni-id）
- TabBar：5 项（首页/商品/订单/会员/俱乐部），俱乐部一期点击 toast "即将上线"
- 订单状态 Tab：全部/待取餐/制作中/已完成/已取消

## Restated Understanding
- 当前任务是：基于已有设计文档，重新制定一份最小粒度、代码可执行的开发计划
- 核心目标是：让开发者拿到计划就能直接写代码，每个任务都有明确边界和验收标准
- 当前边界是：只包含一期功能（不含二期标记的模块）
- 暂不处理：社区模块、店员收银、积分商城、签到、分享裂变等二期功能

## 执行顺序（关键约束）

```
Phase 0: 前置准备
  ├── 0.1 工程骨架搭建（pnpm monorepo、uni-app、vben-admin）
  ├── 0.2 设计规范落地（颜色、字体、间距、组件库配置）
  ├── 0.3 Mock 服务搭建（基于 api-contracts.md 的 Mock 数据层）
  └── 0.4 共享包初始化（types、utils、constants、theme）

Phase 1: H5 前端开发（基于 Mock 数据）
  ├── 1.1 页面骨架与全局组件（TabBar 5项：首页/商品/订单/会员/俱乐部、导航、布局）
  ├── 1.2 首页（商品分类、列表、搜索、Banner）
  ├── 1.3 商品详情（SKU 选择、加购、立即购买）
  ├── 1.4 购物车（列表、选择、数量调整、结算）
  ├── 1.5 订单确认（桌号、备注、折扣计算、积分抵扣）
  ├── 1.6 订单支付（收钱吧 JSAPI、轮询、结果页）
  ├── 1.7 订单管理（列表、详情、状态流转[待取餐/制作中/已完成/已取消]、再来一单）
  ├── 1.8 会员中心（信息、资产、升级进度、功能入口）
  ├── 1.9 会员权益（等级对比、权益明细）
  ├── 1.10 会员充值（档位选择、支付、结果）
  ├── 1.11 积分明细（流水列表、筛选）
  ├── 1.12 充值记录（列表、状态）
  └── 1.13 用户资料（头像、昵称、手机号绑定）

Phase 2: 后台管理前端开发（基于 Mock 数据）
  ├── 2.1 登录页（账密、JWT、记住我）
  ├── 2.2 首页 Dashboard（数据概览、图表、快捷入口）
  ├── 2.3 商品管理（列表、搜索、编辑、SKU、上下架）
  ├── 2.4 订单管理（列表、搜索、详情、状态更新）
  ├── 2.5 会员管理（列表、搜索、详情、积分调整）
  └── 2.6 系统管理（账号列表、角色权限、个人设置）

Phase 3: 服务端 API/云函数开发
  ├── 3.1 数据库初始化（集合创建、索引、初始数据）
  ├── 3.2 认证模块（wx-auth、check-token、admin-login）
  ├── 3.3 商品模块（goods-list、goods-detail、admin-goods-list、admin-goods-save）
  ├── 3.4 订单模块（order-create、order-pay-callback、order-list、order-detail、admin-orders-list、admin-order-update）
  ├── 3.5 会员模块（member-info、member-benefits、member-point-logs、member-recharge-tiers、member-recharge、member-recharge-callback、member-recharge-logs、member-point-calculate）
  ├── 3.6 后台管理模块（admin-members-list、admin-members-detail、admin-point-adjust）
  ├── 3.7 支付联调（收钱吧沙箱、统一下单、回调验签）
  └── 3.8 定时任务（积分过期清理、订单超时取消）

Phase 4: 联调与部署
  ├── 4.1 Mock 切换真实 API
  ├── 4.2 端到端联调（点单 → 支付 → 积分 → 订单）
  ├── 4.3 异常场景验证（超时、取消、库存不足、余额不足）
  ├── 4.4 性能优化（首屏 <3s、图片懒加载、CDN）
  └── 4.5 部署上线（uniCloud 托管、域名配置、HTTPS）
```

## 关键设计决策

### 1. Mock 先行策略
- 前端开发阶段全部使用 Mock 数据，Mock 层严格遵循 api-contracts.md 的 Req/Res 结构
- Mock 服务封装在 `packages/shared/src/mock/` 目录，支持开关切换（VITE_USE_MOCK=true/false）
- 每个 API 对应一个 Mock handler，返回符合契约的模拟数据

### 2. 前后端分离
- 前端通过 HTTP 调用云函数 URL 化接口，不直接操作数据库
- 所有业务逻辑封装在云函数中，前端只负责 UI 渲染和用户交互
- 共享类型定义在 `packages/shared/src/types/` 中，前后端共用

### 3. 代码组织原则
- **单一职责**：每个组件/函数只做一件事
- **可扩展**：通过配置驱动，避免硬编码（如会员等级配置、充值档位配置）
- **结构化**：按功能模块分层（api / components / composables / pages / stores / utils）

### 4. 一期功能边界
| 模块 | 包含 | 不包含（二期） |
|:---|:---|:---|
| H5 前端 | 首页、商品、购物车、订单、会员、充值、积分 | 社区动态、发帖、帖子详情、店员收银 |
| 后台管理 | 商品、订单、会员、系统 | 社区管理 |
| 服务端 | 认证、商品、订单、会员、支付 | 社区、收银 |

### 5. 设计契约文档映射

> **Spec 文件仅描述开发任务和 UI 规范，字段结构、业务规则、接口契约定义在以下独立文档中。**
> 开发时请**同时打开**对应 spec 文件和契约文档，**禁止猜测字段名或数据结构**。

#### 5.1 契约文档索引

| 契约文档 | 路径 | 提供内容 | 被哪些 Spec 引用 |
|:---|:---|:---|:---|
| **API 接口契约** | `mydocs/api-contracts.md` | 34 个接口的完整 Req/Res 结构、错误码、全局约定（金额单位、时间格式、认证方式） | p1-h5-home, p1-h5-trade, p1-h5-member, p2-admin, p3-server |
| **数据库 Schema** | `mydocs/db-schema.md` | 10 个 MongoDB 集合的字段定义、索引配置、集合关系 | p3-server |
| **会员体系设计** | `mydocs/member-system-design.md` | 7 级等级表、充值 4 档 1:1:1 模型、积分规则、分品类折扣、开业活动 | p1-h5-member, p2-admin, p3-server |

#### 5.2 API 模块 → Spec 精确映射

| API 列表 | api-contracts.md 章节 | 对应 Spec（谁来实现） | 谁在调用 |
|:---|:---|:---|:---|
| wx-auth, check-token, admin-login | §2 认证模块 | p3-server | H5 全局 + admin 登录 |
| goods-list, goods-detail | §3 商品模块 | p3-server | p1-h5-home, p1-h5-trade |
| order-create, order-pay-callback, order-list, order-detail | §4 订单模块 | p3-server | p1-h5-trade |
| member-info, member-benefits, member-point-logs, member-recharge-tiers, member-recharge, member-recharge-callback, member-recharge-logs, member-point-calculate | §5 会员模块 | p3-server | p1-h5-member, p1-h5-trade |
| admin-goods-list, admin-goods-save, admin-orders-list, admin-order-update, admin-members-list, admin-members-detail, admin-point-adjust | §8 后台管理模块 | p3-server | p2-admin |

#### 5.3 数据库集合 → Spec 精确映射

| 集合名 | db-schema.md 章节 | 用途 | 操作方 |
|:---|:---|:---|:---|
| members | §2 会员相关集合 → 2.1 | 会员主表 | p3-server §3.5 |
| member_levels | §2 会员相关集合 → 2.2 | 7 级等级配置 | p3-server §3.5 |
| point_logs | §2 会员相关集合 → 2.3 | 积分变动流水 | p3-server §3.5 |
| recharge_logs | §2 会员相关集合 → 2.4 | 充值记录 | p3-server §3.5 |
| activities | §2 会员相关集合 → 2.5 | 开业活动配置 | p3-server §3.5（二期） |
| goods | §3 商品订单相关集合 | 商品主表 | p3-server §3.3 |
| orders | §3 商品订单相关集合 | 订单主表 | p3-server §3.4 |
| community_posts/comments/likes | §4 社区相关集合 | 社区内容 | 二期 |
| admin_users | §5 后台管理相关集合 | 后台账号 | p3-server §3.6 |

## Change Log
- 2026-05-23: 初始版本，基于 full-feature-list.md 重新制定
