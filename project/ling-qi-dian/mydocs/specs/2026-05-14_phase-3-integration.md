# Spec: Phase 3 — 前后端联调与部署上线

> 🔗 本阶段将 Phase 2-F（前端）与 Phase 2-B（后端）合并，替换 Mock 为真实调用，部署到生产环境。
> 依赖全部 P3 前置条件就绪（域名备案、公众号认证、收钱吧回调 URL）。

## Goal
- 要解决的问题：前端还是 Mock 数据、后端未与前对接、三端未部署到公网
- 验收结果：`m.bikeclub.cn` 域名下三端正常访问，全业务流程闭环，可正式营业

## Done Contract
- 完成定义：
  - 前端 Mock 层切换为真实云函数 URL 调用
  - 三端全流程联调通过（至少覆盖核心路径 3 条）
  - 异常场景处理就绪（支付超时、Token 过期、网络异常、库存不足）
  - 三端打包构建无报错
  - uniCloud 前端托管部署完毕，`m.bikeclub.cn` 可访问
  - 三端路由正常（`/` → 点单、`/community/` → 社区、`/admin/` → 后台）
  - 云函数 URL 化已配置，收钱吧回调可正常触发
  - 桌台码生成并可用
- 证明来源：生产域名全流程走通，多人测试无异常
- 仍未完成的情况：页面 404、支付生产环境失败、云函数超时、路由 fallback 不生效

## Scope
- In:
  - **Mock 切换层**：
    - 添加环境变量 `VITE_API_MODE=mock|real` 控制
    - 开发时默认 Mock，联调/生产切换为真实调用
    - shared 包 API 模块改造：支持两种模式热切换
  - **样式与主题验证**：
    - app 端 UnoCSS 生产构建正常，主题切换无闪烁
    - admin 端 vben 暗色模式生产环境可用
  - **全流程联调**（按模块逐项验证）：

    **认证链路**
    - [ ] 微信内访问 → 网页授权 → `wx-auth` → token 返回到前端 → 存储
    - [ ] Token 过期 → API 返回 401 → 自动重新授权
    - [ ] 后台账密登录 → `admin-login` → JWT 存储

    **点单支付链路（核心）**
    - [ ] 浏览商品（分类筛选、分页加载）
    - [ ] 选择规格 → 加入购物车 → 购物车管理
    - [ ] 确认订单（桌号、备注、金额计算）
    - [ ] 调起微信支付 → `order-create` → 收钱吧 JSAPI → 支付成功
    - [ ] 支付回调 → 订单状态 `making` → 积分入账
    - [ ] 支付超时 → 手动查单 → 状态同步

    **会员链路**
    - [ ] 会员中心数据正确（积分、等级、余额、消费）
    - [ ] 积分流水与订单关联
    - [ ] 等级自动升降（根据累计消费）

    **收银链路**
    - [ ] 密码进入收银端
    - [ ] 现金收款：创建订单 → `source=cashier,pay_way=cash`
    - [ ] 余额收款：扫描会员码 → 余额扣款（原子操作）
    - [ ] 微信收款：生成二维码 → 顾客扫码付

    **社区链路**
    - [ ] 发帖（图文 + 路线）→ 图片上传云存储 → 动态广场可见
    - [ ] 帖子详情 → 评论 → 点赞/取消
    - [ ] 用户主页（帖子列表）
    - [ ] 后台删除违规帖子

    **后台管理链路**
    - [ ] 商品上下架 → 点单端即时反映
    - [ ] 订单管理（查看、筛选、接单）
    - [ ] 会员管理（查看、积分调整）

  - **异常处理补充**：
    - 支付超时：前端轮询 + 手动查单按钮
    - Token 过期：401 拦截 → 自动重新授权
    - 网络异常：统一 toast + 重试
    - 库存不足：下单时校验
    - 余额不足：扣款时提示
    - 云函数超时：前端 loading + 错误提示
    - 图片上传失败：重试 + 前端尺寸预检

  - **打包与部署**：

    | 项目 | 打包命令 | 输出目录 | 托管路径 |
    |---|---|---|---|
    | uni-app（点单+社区） | `pnpm --filter app build:h5` | `dist/build/h5/` | 根目录 `/`（含 `/community/` 子路由） |
    | 后台管理 | `pnpm --filter admin build` | `dist/` | `/admin/` |

    - 前端托管 path rewrite 配置（SPA fallback）：
      - `/community/*` → `/index.html`（uni-app H5 history 模式统一入口）
      - `/admin/*` → `/admin/index.html`
    - 云函数 URL 化：为需外部访问的函数配置 HTTP 路径
      - `order-pay-callback` → 收钱吧回调地址
    - 收钱吧回调 URL 更新为生产环境云函数地址

  - **生产环境配置清单**：
    - [ ] 公众号：网页授权域名 `m.bikeclub.cn`
    - [ ] 公众号：JS 安全域名 `m.bikeclub.cn`
    - [ ] 公众号：IP 白名单（云函数出口 IP）
    - [ ] 公众号：自定义菜单（点单 + 社区）
    - [ ] 收钱吧：支付授权目录 `https://m.bikeclub.cn/order/`
    - [ ] 收钱吧：支付回调 URL（云函数 URL 化地址）
    - [ ] uniCloud：前端托管自定义域名 `m.bikeclub.cn`
    - [ ] DNS：CNAME 指向 uniCloud 前端托管域名

  - **运营工具**：
    - 桌台码生成（含桌号参数）
    - 会员码验证
- Out:
  - CI/CD 自动化部署（手动上传即可）
  - 性能优化（CDN、图片压缩、首屏优化 — 后续迭代）
  - 数据备份策略（后续迭代）
  - 监控告警（先依赖 uniCloud 控制台）

## Facts / Constraints
- 已确认：
  - uniCloud 前端托管支持自定义域名 + path rewrite
  - 云函数 URL 化后暴露 HTTPS 接口，格式 `https://fc-mp-xxx.bspapp.com/functionName`
  - 公众号网页授权域名限制 2 个
- 技术约束：
  - uni-app H5 build 后为静态文件，放托管根目录
  - vben-admin 需配置 `base: '/admin/'`，打包输出到 `dist/`
  - 微信支付授权目录精度到 `/order/`
  - 前端托管 path rewrite 需手动配置路由 fallback
- 已知风险：
  - ICP 备案未完成则前端托管自定义域名不可用（需先确认 uniCloud 阿里云版是否要求备案）
  - 公众号认证未完成则微信授权不可用（影响 H5 点单 + 社区入口）
  - 收钱吧生产环境需要真实交易验证
  - 三端在一个域名下，SPA 路由各自 fallback 不能互相干扰

## 联调顺序

### 第 1 步：基础设施就绪
- uniCloud 前端托管自定义域名验证
- 云函数 URL 化并验证外部可达
- 公众号域名配置（授权 + JS 安全 + IP 白名单）

### 第 2 步：认证链路联调
- 微信网页授权 → token 获取 → 前端存储
- 后台登录 → JWT → 路由守卫

### 第 3 步：点单支付链路联调（最高优先级）
- 商品浏览 → 下单 → 支付 → 回调 → 积分
- 这是核心业务链路，优先保障

### 第 4 步：会员模块联调
- 积分数值正确性验证
- 等级自动升降验证

### 第 5 步：收银模块联调
- 三种收款方式验证
- 余额原子操作验证

### 第 6 步：社区模块联调
- 发帖 → 展示 → 评论 → 点赞

### 第 7 步：后台管理联调
- 商品/订单/会员管理操作生效验证

### 第 8 步：打包构建 + 部署
- app（点单+社区）：`pnpm --filter app build:h5`
- admin（vben-admin）：`pnpm --filter admin build`
- 上传 uniCloud 前端托管
- 配置 path rewrite（`/community/*` → `/index.html`，`/admin/*` → `/admin/index.html`）

### 第 9 步：生产验证
- 桌台码扫码全流程
- 多人并发测试
- 异常场景覆盖

## Restated Understanding
- 当前任务：Mock 切换真实 API → 全流程联调 → 部署上线
- 当前核心目标：`m.bikeclub.cn` 稳定运行，全业务闭环可用
- 暂不处理：CI/CD、性能优化、监控告警

## Checkpoint Summary
- 当前任务理解：前后端合并联调 + 生产环境部署
- 当前核心目标：生产环境可正常营业
- 当前进度：依赖 Phase 2-F + Phase 2-B 完成 + P3 前置条件就绪
- 联调顺序：基础设施→认证→点单支付→会员→收银→社区→后台→部署→验证
- 涉及文件/模块：
  - `packages/shared/src/api/` Mock/Real 切换
  - app + admin 打包配置
  - uniCloud 前端托管配置
  - 云函数环境变量（生产 URL）
  - 公众号/收钱吧后台配置
- 风险：ICP 备案、公众号认证、前端托管路由冲突
- 验证方式：生产域名全流程走通，多人测试
- Execution Approval: `Pending`

## Change Log
- 2026-05-14: v1.0 — 整合联调与部署为一个阶段
- 2026-05-14: v1.1 — 社区合并到 uni-app（条件编译 H5 only），admin 采用 vben-admin 框架
- 2026-05-14: v1.2 — 样式方案统一为 UnoCSS，Phase 3 增加主题验证

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
- 当前状态：Spec 已就绪，依赖 Phase 2-F + Phase 2-B 完成 + P3 前置就绪
- 当前卡点：前序阶段未执行 + P3 备案审核中
- 下一步：前序完成 + 备案通过后，从基础设施配置开始
