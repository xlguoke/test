# Spec: Phase 2-F — 前端开发（Mock 驱动，独立跑通）

> 🔥 本阶段**不依赖任何后端服务、不依赖任何第三方平台审核**。
> 基于 Phase 1 产出的 API Contracts 搭建 Mock 层，前端可独立完成全部页面与交互流程。

## Goal
- 要解决的问题：用户可见的界面和操作流程尚不存在
- 验收结果：三端全部页面可用 Mock 数据正常渲染，全流程可走通（点单→支付模拟→积分→社区发帖→后台管理）

## Done Contract
- 完成定义：
  - uni-app 点单端 10 个页面全部实现，Mock 数据驱动（全平台通用）
  - uni-app 社区端 4 个页面全部实现，Mock 数据驱动（H5 only，条件编译）
  - 后台管理端 9 个页面全部实现，Mock 数据驱动
  - Mock 层覆盖全部 30 个 API 接口，响应格式与 API Contracts 一致
  - 三端路由守卫正常（未登录跳转、后台无 token 跳转登录）
  - 微信支付调起在非微信环境有降级提示
- 证明来源：浏览器中手动操作三端全流程，页面渲染正常、交互无报错
- 仍未完成的情况：页面白屏/报错、Mock 数据格式与契约不一致、路由跳转失败

## Scope
- In:
  - **Mock 基础设施**（`packages/shared/src/mock/`）：
    - `mockServer.ts`：统一 Mock 拦截器（拦截 `uniCloud.callFunction` / `fetch`）
    - `mockData/`：按模块组织的 Mock 数据文件（auth、goods、order、member、cashier、community、admin）
    - Mock 数据与 API Contracts 类型完全对齐
  - **样式与主题**：
    - app 端：UnoCSS（`@unocss/uni-app`），CSS Variables 实现主题切换（亮色/暗色）
    - admin 端：vben-admin 内置 UnoCSS + 内置暗色模式
    - shared 包：导出主题色变量定义
  - **uni-app 点单端（`packages/app/src/pages/`）**：10 个页面（全平台通用）

    | 路由 | 页面 | 核心交互 |
    |---|---|---|
    | `/` | 商品主页 | 分类 Tab 切换、商品卡片列表、购物车浮标数字 |
    | `/goods/detail?id=xx` | 商品详情 | SKU 选择弹窗、数量加减、加入购物车 |
    | `/cart` | 购物车 | 商品列表、数量调整、删除、合计金额、去结算 |
    | `/order/confirm` | 确认订单 | 桌号输入、备注、价格明细、会员折扣展示 |
    | `/order/pay?orderNo=xx` | 支付页 | 金额展示、微信支付按钮（Mock 模拟支付结果）、轮询查单 |
    | `/order/list` | 订单列表 | 状态 Tab 筛选、分页加载 |
    | `/order/detail?id=xx` | 订单详情 | 完整订单信息 |
    | `/member/index` | 会员中心 | 头像/昵称/等级/积分/余额/累计消费、会员码 |
    | `/member/pointLogs` | 积分明细 | 分页流水列表 |
    | `/cashier` | 店员收银 | 密码入口→商品选择→三种收款方式→会员识别 |

  - **uni-app 社区端（`packages/app/src/pages-community/`）**：4 个页面（H5 only，条件编译）

    | 路由 | 页面 | 核心交互 |
    |---|---|---|
    | `/community/` | 动态广场 | 帖子信息流、分页加载、下拉刷新 |
    | `/community/post/create` | 发帖 | 图文编辑器、路线信息录入、图片选择 |
    | `/community/post/detail?id=xx` | 帖子详情 | 内容展示、点赞、评论列表、发表评论 |
    | `/community/user/profile?id=xx` | 用户主页 | 用户信息、发帖列表 |

    > 社区页面通过条件编译控制：H5 打包时合并到 `pages.json`，小程序打包时排除。实现方式：构建脚本动态合并 `pages.json` + `pages-community.json`。

  - **后台管理端（`packages/admin/`）**：基于 vben-admin 框架，开发 9 个业务页面

    > vben-admin 已提供：登录模板、布局框架（侧边栏+顶部+标签页）、表格 CRUD 封装、表单验证、权限路由、主题切换。仅需开发业务页面。

    | 路由 | 页面 | 核心交互 | vben 提供 |
    |---|---|---|---|
    | `/admin/login` | 登录 | 账密表单、对接 `admin-login` 云函数 | ✅ 模板，替换 API |
    | `/admin/goods/list` | 商品列表 | 搜索、分类筛选、上下架、新增按钮 | ✅ Table 封装 |
    | `/admin/goods/edit?id=xx` | 商品编辑 | 基本信息 + SKU 增删改 | ✅ Form 封装 |
    | `/admin/orders/list` | 订单列表 | 状态筛选、时间范围、分页 | ✅ Table 封装 |
    | `/admin/orders/detail?id=xx` | 订单详情 | 完整信息、接单操作 | 自定义 |
    | `/admin/members/list` | 会员列表 | 搜索、分页 | ✅ Table 封装 |
    | `/admin/members/detail?id=xx` | 会员详情 | 会员信息、积分调整、储值操作 | 自定义 |
    | `/admin/community/posts` | 社区管理 | 帖子列表、删除操作 | ✅ Table 封装 |
    | `/admin/system/users` | 系统用户 | 后台账号列表（占位） | ✅ Table 封装 |

    **需要自研的代码**：
    - `useAdminAuth` store（对接 `admin-login` 云函数，JWT 存储）
    - 菜单配置文件（仅保留商品、订单、会员、社区、系统用户）
    - 9 个业务页面的 `<script setup>` + `<template>`（表格列定义、表单字段、API 调用）

  - **共享组件库**（`packages/shared/src/components/`，可选）：
    - `PageLoading`、`EmptyState`、`ErrorRetry`、`InfiniteScroll`
  - **路由守卫**：
    - H5 点单 + 社区：未登录 → 触发微信授权流程（Mock 模拟）
    - 后台管理：无 token → 跳转 `/admin/login`
- Out:
  - 真实支付对接（Phase 3 替换 Mock 为真实云函数调用）
  - 图片实际上传（先用占位图 + Mock URL；真实上传在 Phase 2-B 云存储配置后）
  - 微信 JS-SDK 真实调用（Mock 模拟 `WeixinJSBridge`）
  - 性能优化、PWA、骨架屏（后续迭代）

## Facts / Constraints
- 已确认：pnpm monorepo，TypeScript，Vue3 Composition API
- 技术约束：
  - uni-app H5 模式下使用 `uni.xxx` API（需 Mock `uni.request` / `uni.showToast` 等）
  - H5 社区和后台管理使用标准 `fetch` 或 `axios`（通过 shared 包统一封装）
  - 所有 API 调用必须经过 shared 包的 `api/` 模块，不直接调 `uniCloud.callFunction`
  - Mock 层通过拦截 shared 包的 API 模块实现，业务代码零侵入
  - 样式方案：app 端 UnoCSS（`@unocss/uni-app`），admin 端 vben 内置 UnoCSS
  - 主题切换：CSS Variables + `data-theme` 属性，支持亮色/暗色
- 已知风险：
  - uni-app 组件在浏览器中与微信内置浏览器表现可能有差异（Phase 3 真机验证）
  - Vant UI 在 uni-app H5 模式下的兼容性（建议 H5 点单端也用 Vant，与社区端一致）
  - UnoCSS 在 uni-app 中的配置需验证（`@unocss/uni-app` 插件兼容性）

## 开发顺序（按模块，可根据人力并行）

### 第 1 步：Mock 层 + 认证模块（所有端的入口依赖）
- 搭建 `packages/shared/src/mock/` 框架
- 编写 auth 相关 Mock 数据
- uni-app 点单端 `useAuth` composable → 可完成登录/登出
- 后台 `authStore` → 可完成登录/登出

### 第 2 步：点单端核心流程（最高优先级业务）
- 商品主页 → 商品详情 → 购物车 → 确认订单 → 支付页 → 订单列表/详情
- Mock 商品数据 8-10 条（覆盖不同分类、多 SKU）
- Mock 支付流程（模拟微信支付成功/失败）

### 第 3 步：会员模块
- 会员中心 + 积分流水
- 会员码展示页

### 第 4 步：后台管理端（基于 vben-admin）
- 初始化 vben-admin 到 `packages/admin/`，移除不需要的模块（国际化、多主题、示例页面）
- 配置菜单：商品、订单、会员、社区、系统用户
- 开发 `useAdminAuth` store，对接 Mock `admin-login`
- 商品 CRUD → 订单管理 → 会员管理 → 系统用户
- 社区管理（可延后到社区端完成后）

### 第 5 步：店员收银端
- 密码入口 → 商品选择 → 现金/余额/微信收款 → 会员识别

### 第 6 步：社区端
- 动态广场 → 发帖 → 帖子详情（含评论+点赞）→ 用户主页
- Mock 帖子数据 5-8 条（含图片、路线）

## Restated Understanding
- 当前任务：基于 API Contracts + Mock 数据，实现三端全部页面
- 当前核心目标：前端全流程可用 Mock 数据走通，不依赖任何后端
- 暂不处理：真实 API 对接、真实支付、图片上传、性能优化

## Checkpoint Summary
- 当前任务理解：三端 23 个页面的完整前端实现
- 当前核心目标：Mock 驱动的全流程可交互原型
- 当前进度：依赖 Phase 1（设计文档）完成
- 开发顺序：Mock 层 → 认证 → 点单 → 会员 → 后台 → 收银 → 社区
- 涉及文件/模块：
  - `packages/shared/src/mock/`（Mock 框架 + 数据）
  - `packages/shared/src/api/`（API 调用封装）
  - `packages/shared/src/components/`（公共 UI 组件）
  - `packages/app/src/pages/`（点单 10 页面 + composables）
  - `packages/app/src/pages-community/`（社区 4 页面，H5 only）
  - `packages/admin/src/`（vben-admin 框架 + 9 业务页面 + stores）
- 风险：uni-app H5 兼容性、微信环境特有 API 无法在浏览器模拟
- 验证方式：浏览器逐页面操作，确认交互流程完整
- Execution Approval: `Pending`

## Change Log
- 2026-05-14: v1.0 — 新增前端独立开发阶段，Mock 驱动
- 2026-05-14: v1.1 — 社区合并到 uni-app（条件编译 H5 only），admin 采用 vben-admin 框架
- 2026-05-14: v1.2 — 样式方案统一为 UnoCSS，app 端 CSS Variables 主题切换

## Validation
- Self-check:
- Static checks:
- Runtime / Test:
- Human confirmation:
- 结果汇总：
- 核心目标是否完成：
- 若未完成，剩余差距：
- 剩余风险：

## Resume / Handoff
- 当前状态：Spec 已就绪，依赖 Phase 1（设计文档 + TS 类型）完成
- 当前卡点：Phase 1 未执行
- 下一步：Phase 1 完成后，先搭建 Mock 框架
