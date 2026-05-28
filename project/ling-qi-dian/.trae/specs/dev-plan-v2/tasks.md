# Phase Roadmap: 机车俱乐部饮品与社区系统 — 开发路线图 v3.0

> **本文件定位：Phase 级别路线图，描述依赖关系、并行策略、工期估算。**
> **详细任务清单在子 Spec 的 tasks.md 中，本文件不重复维护。**
> **设计契约文档映射参见** [spec.md](./spec.md) 第 5 节。

---

## 整体执行顺序

```
Phase 0（骨架+主题+Mock） ──┬──→ Phase 1（H5 前端） ──┐
                            │                          ├──→ Phase 4（联调部署）
                            └──→ Phase 2（后台前端） ──┤
                                                       │
                                      Phase 3（服务端） ─┘
```

| Phase | 名称 | 工期 | 可并行 |
|:---|:---|:---|:---|
| 0 | 前置准备 | 3-4 人日 | 内部子任务串行 |
| 1 | H5 前端 | 10-12 人日 | 与 Phase 2 并行 |
| 2 | 后台管理前端 | 7-8 人日 | 与 Phase 1 并行 |
| 3 | 服务端 API | 8-10 人日 | Phase 1+2 完成关键路径后启动 |
| 4 | 联调部署 | 3-4 人日 | — |
| **合计** | | **31-38 人日** | |

---

## Phase 0: 前置准备

> **详细任务：** [p0-theme-engine/tasks.md](../p0-theme-engine/tasks.md)
> **无前置依赖**，可在任意时间启动。
> **设计契约：** 本 Phase 无外部契约依赖，主题规范自包含。

| 子任务组 | 核心交付 | 包含在子 Spec |
|:---|:---|:---|
| 0.1 工程骨架 | pnpm monorepo 可运行，app/admin/shared 三包互通 | [tasks.md](../p0-theme-engine/tasks.md) |
| 0.2 设计规范 | CSS Variables + Vant 主题覆盖，禁止硬编码色值 | [tasks.md](../p0-theme-engine/tasks.md) |
| 0.3 Mock 服务 | 基于 api-contracts.md 的所有 Mock handler | [tasks.md](../p0-theme-engine/tasks.md) |
| 0.4 共享包 | 类型定义 + 常量枚举 + 工具函数（format/validate/request） | [tasks.md](../p0-theme-engine/tasks.md) |

---

## Phase 1: H5 前端开发（基于 Mock 数据）

> **设计契约：** [api-contracts.md](../../../mydocs/api-contracts.md) §3 商品 + §4 订单 + §5 会员
> **会员规则：** [member-system-design.md](../../../mydocs/member-system-design.md)

### 执行顺序（内部串行）

```
p1-h5-home（TabBar+导航）──→ p1-h5-home（首页完整）
                           ├──→ p1-h5-trade（商品→购物车→下单→支付→订单）
                           └──→ p1-h5-member（会员中心+权益+充值+积分+记录+资料）
```

### 模块索引

| 模块 | 子 Spec | 核心页面 | 工期 |
|:---|:---|:---|:---|
| 全局骨架 | — | TabBar + NavBar + useAuth + useCart | 含在 p1-h5-home |
| 首页 | [p1-h5-home](../p1-h5-home/) | Banner 轮播、分类 Tab、商品网格、搜索、CartFloatButton | 2-3 天 |
| 商品交易 | [p1-h5-trade](../p1-h5-trade/) | 商品详情→SKU 选择→购物车→订单确认→支付→订单管理 | 4-5 天 |
| 会员中心 | [p1-h5-member](../p1-h5-member/) | 会员中心、权益页、充值（4档1:1:1）、积分记录、充值记录、用户资料 | 3-4 天 |

### 并行策略

- 首页与会员中心可并行开发
- 商品→购物车→订单管线必须串行
- 用户资料独立，可与任意模块并行

---

## Phase 2: 后台管理前端开发（基于 Mock 数据）

> **详细任务：** [p2-admin/tasks.md](../p2-admin/tasks.md)
> **设计契约：** [api-contracts.md](../../../mydocs/api-contracts.md) §8 后台管理
> **会员规则：** [member-system-design.md](../../../mydocs/member-system-design.md) §一 等级体系

### 执行顺序（内部串行）

```
登录页 → Dashboard → {商品管理 ‖ 订单管理 ‖ 会员管理 ‖ 系统管理} → 会员配置管理
```

### 模块索引

| 模块 | 核心页面 | 工期 |
|:---|:---|:---|
| 登录 | 品牌图 + 表单 + JWT Token 存储 | 0.5 天 |
| Dashboard | 统计卡片 + ECharts 图表 + 最近订单 | 1 天 |
| 商品管理 | 列表（搜索/筛选/排序/开关） + 编辑（表单+SKU+预览） | 1.5 天 |
| 订单管理 | 列表（搜索/状态 Tag）+ 详情（时间轴+操作按钮） | 1.5 天 |
| 会员管理 | 列表（等级 Tag/排序）+ 详情 + 积分调整 | 1.5 天 |
| 系统管理 | 账号 CRUD + 权限 + 个人设置 | 0.5 天 |
| 会员配置 | 等级权益配置 + 充值档位配置（二期） | 0.5 天 |

---

## Phase 3: 服务端 API/云函数开发

> **详细任务：** [p3-server/tasks.md](../p3-server/tasks.md)
> **设计契约：** [api-contracts.md](../../../mydocs/api-contracts.md) 全文 + [db-schema.md](../../../mydocs/db-schema.md) 全文 + [member-system-design.md](../../../mydocs/member-system-design.md) 全文

### 执行顺序（内部串行）

```
DB 初始化 → 认证 JWT → {商品 ‖ 订单 ‖ 会员} → 后台 API → 支付联调 → 定时任务
```

### 模块索引

| 模块 | 核心接口 | 工期 |
|:---|:---|:---|
| 数据库 | 10 集合 + 索引 + 初始数据 + dbService 封装 | 1 天 |
| 认证 | wx-auth, check-token, admin-login | 1 天 |
| 商品 | goods-list, goods-detail | 1 天 |
| 订单 | order-create, order-pay-callback, order-list, order-detail | 2 天 |
| 会员 | member-info, member-benefits, member-recharge-tiers, member-recharge, member-recharge-callback, member-point-logs, member-recharge-logs, member-point-calculate | 2 天 |
| 后台 API | admin-goods-*, admin-orders-*, admin-members-*, admin-point-adjust | 1.5 天 |
| 支付 | 收钱吧 JSAPI 对接 + 回调验签 + 轮询查单 | 1.5 天 |
| 定时任务 | 积分过期扫描（二期） | 0.5 天 |

---

## Phase 4: 联调与部署

> **详细任务：** [p4-deploy/tasks.md](../p4-deploy/tasks.md)
> **本 Phase 无外部契约依赖。**

### 执行顺序

```
Mock→真实API切换 → 端到端联调 → 异常场景验证 → 性能优化 → 部署上线
```

### 核心步骤

| 步骤 | 内容 | 工期 |
|:---|:---|:---|
| API 切换 | 移除 Mock 拦截、配置真实接口地址、全局 Token 注入 | 0.5 天 |
| 端到端联调 | 全链路走通（注册→浏览→下单→支付→取餐→积分→充值→升级） | 1 天 |
| 异常恢复 | 网络断开、支付超时、库存不足、Token 过期等场景 | 0.5 天 |
| 性能优化 | 首屏 <3s、API <200ms、图片懒加载、分包加载 | 0.5 天 |
| 部署上线 | 云函数发布、前端打包、Nginx 配置、HTTPS、监控 | 0.5 天 |