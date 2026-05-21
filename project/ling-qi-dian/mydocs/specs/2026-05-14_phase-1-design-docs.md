# Spec: Phase 1 — 全局设计文档

> ⚠️ 本阶段是整个项目的「契约层」，产出 3 份设计文档。
> 前端基于 API Contacts 可直接 Mock 跑通全部流程（不依赖后端）；
> 后端基于 DB Schema + API Contracts 逐接口实现（不依赖前端）。

## Goal
- 要解决的问题：前后端没有统一的接口契约和数据结构定义，无法并行开发
- 验收结果：3 份设计文档完整覆盖系统全部功能，前/后端拿到即可独立开工

## Done Contract
- 完成定义：
  - `mydocs/db-schema.md`：全部 7 个集合的字段定义、类型、索引、关联关系
  - `mydocs/api-contracts.md`：全部 30 个云函数的接口契约（路径、Method、Req/Res 类型、错误码）
  - `mydocs/frontend-routes.md`：三端全部页面路由、组件树、数据流
  - `packages/shared/src/types/`：与 API Contracts 对应的 TypeScript 类型文件
- 证明来源：review 三份文档，覆盖方案文档中所有功能点，无一遗漏
- 仍未完成的情况：文档有遗漏接口/字段、TS 类型与契约不一致

## Scope
- In:
  - **DB Schema 文档（`mydocs/db-schema.md`）**：
    - 集合清单：`members`、`point_logs`、`goods`、`orders`、`community_posts`、`community_comments`、`community_likes`、`admin_users`、`cashier_sessions`
    - 每个集合：字段名、类型、必填、默认值、说明、索引
    - 关联关系图
    - MongoDB 文档示例
  - **API Contracts 文档（`mydocs/api-contracts.md`）**：
    - 按模块分组：认证、商品、订单、支付、会员、收银、社区、后台管理
    - 每个接口：云函数名、HTTP Method、Path、Request Body/Query Type、Response Type、错误码
    - 全局约定：认证 Token 传递方式、分页格式、金额单位（分）、时间格式
  - **解耦与迁移设计文档（`mydocs/decoupling-design.md`）**：
    - 四层解耦架构：数据访问层、支付服务层、认证服务层、前端 API 层
    - 每层对外接口定义、实现位置、未来可替换方案
    - 迁移路径：从 uniCloud 迁移到自建 Node 服务的步骤与成本估算
    - 前端 API 层 Mock/Real 热切换机制
  - **前端路由文档（`mydocs/frontend-routes.md`）**：
    - H5 点单端：10 个页面路由 + 组件树 + 数据依赖（哪个页面调哪些 API）
    - H5 社区端：4 个页面路由 + 组件树
    - 后台管理端：9 个页面路由 + 菜单结构
    - 三端共享组件清单
  - **前端线框与视觉规范文档（`mydocs/frontend-wireframes.md`）**：
    - 全部 23 个页面的布局结构（ASCII 线框图）、展示元素清单、交互状态
    - 参考产品清单：瑞幸咖啡（点单交互）、小红书（社区信息流）、Keep（路线数据展示）
    - 视觉风格建议：机车俱乐部「硬朗 + 工业风」配色方案、字体、卡片风格、动效规范
    - Vant UI 组件映射表（每个页面用哪些 Vant 组件）
  - **TS 类型（`packages/shared/src/types/`）**：
    - 与 API Contracts 100% 对应的 Request/Response 类型
    - 业务实体类型（Member、Goods、Order、Post 等）
    - 公共类型（PaginatedResponse、ApiError 等）
- Out:
  - 任何业务代码实现（那是 Phase 2-F / 2-B 的事）
  - UI 设计稿 / 交互原型（可在 Phase 2-F 中细化）
  - 云函数实现代码

## Facts / Constraints
- 已确认：方案文档 v1.0 已覆盖完整业务需求，可作为基线
- 技术约束：
  - 金额统一用「分」（int）存储和传输
  - 时间统一用 ISO 8601 字符串或毫秒时间戳
  - 分页统一格式：`{ page, pageSize, total, list }`
  - 认证 Token 在 HTTP Header `Authorization: Bearer <token>`
- 已知风险：方案文档中的 DB 设计与最终实现可能有字段级偏差，需在本文档中明确

## Restated Understanding
- 当前任务：产出 5 份设计文档 + shared TS 类型，作为前后端的唯一真相源
- 当前核心目标：文档完整到「前/后端拿到就能独立开发，不需要再沟通接口」
- 暂不处理：任何编码实现

## Checkpoint Summary
- 当前任务理解：设计文档先行，契约驱动开发
- 当前核心目标：5 份文档 + TS 类型完整覆盖全部功能
- 下一步 1：以方案文档 v1.0 为基线，逐集合明确 DB Schema → 落盘 `db-schema.md`
- 下一步 2：基于 DB Schema + 业务场景，逐模块列出 API 接口 → 落盘 `api-contracts.md`
- 下一步 3：基于 API Contracts，设计三端路由与组件树 → 落盘 `frontend-routes.md`
- 下一步 4：编写解耦与迁移设计文档 → 落盘 `decoupling-design.md`
- 下一步 5：编写前端线框与视觉规范文档 → 落盘 `frontend-wireframes.md`
- 下一步 6：根据 API Contracts 生成 `packages/shared/src/types/` TS 类型文件
- 下一步 7：五份文档交叉验证（路由调用的 API 是否都在契约中？DB 字段是否支撑所有 API？解耦层是否覆盖全部外部依赖？线框图是否覆盖全部页面？）
- 涉及文件/模块：
    - `mydocs/db-schema.md`
    - `mydocs/api-contracts.md`
    - `mydocs/frontend-routes.md`
    - `mydocs/decoupling-design.md`
    - `mydocs/frontend-wireframes.md`
    - `packages/shared/src/types/`（多个 .ts 文件）
- 风险：需求理解偏差导致文档返工；建议每份文档产出后先 review 再进入下一份
- 验证方式：人工 review，对照方案文档 v1.0 逐功能点核对
- Execution Approval: `Pending`

## Change Log
- 2026-05-14: v1.0 — 新增设计文档阶段，实现前后端解耦并行
- 2026-05-14: v1.1 — 新增解耦与迁移设计文档（decoupling-design.md）
- 2026-05-14: v1.2 — 新增前端线框与视觉规范文档（frontend-wireframes.md），参考瑞幸/小红书/Keep

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
- 当前状态：Spec 已就绪，依赖 Phase 0 完成（需要有 `packages/shared/` 目录存放类型文件）
- 当前卡点：Phase 0 未执行
- 下一步：Phase 0 完成后，从 DB Schema 开始逐份产出文档
