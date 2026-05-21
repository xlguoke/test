# Spec: Phase 0 — 工程骨架与基础设施

## Goal
- 要解决的问题：两个前端子项目（uni-app 点单+社区、独立 admin）+ 一个共享包尚不存在，无法开始任何开发
- 验收结果：pnpm monorepo 可用，3 个 package 各自 `pnpm dev` 启动成功，浏览器可见默认页

## Done Contract
- 完成定义：根目录 `pnpm install` 一次性安装全部依赖；`packages/shared` 可被其他包 `import { ... } from '@bikeclub/shared'`；三端 dev server 各自可见默认首页
- 证明来源：浏览器访问各 dev server URL（3 个不同端口），显示对应框架默认页面
- 仍未完成的情况：任一个 package 启动报错、shared 包类型导入 TS 报错、uni-app H5 编译失败

## Scope
- In:
  - pnpm workspace 根配置
  - 根目录 `pnpm-workspace.yaml`、`package.json`、`tsconfig.base.json`、`.gitignore`
  - `packages/shared`：TS 空包，`index.ts` 占位导出
  - `packages/app`：uni-app (Vue3 + TS) 模板，H5 模式含点单+社区（社区条件编译 H5 only），未来小程序只打包点单
  - `packages/admin`：基于 vben-admin 框架，Vue3 + Vite + TS + Ant Design Vue，独立 PC 后台
  - 三项目各自配置 dev server 端口不冲突
  - 样式方案：app 端采用 UnoCSS（`@unocss/uni-app`），admin 采用 vben 内置 UnoCSS
- Out:
  - uniCloud 云函数目录（Phase 2-B）
  - 任何业务路由、页面、组件（Phase 2-F）
  - ESLint / Prettier / Husky（后续按需）
  - uni-app 多端编译（仅验证 H5）

## Facts / Constraints
- 已确认：本地有 volta，pnpm 作为包管理器，TypeScript 开发
- 技术约束：pnpm ≥ 8、Node ≥ 18（推荐 20）、TS 5.x
- 已知风险：uni-app Vue3 模板与 pnpm workspace 兼容性需验证

## Restated Understanding
- 当前任务：创建 pnpm monorepo 空骨架，不含任何业务代码
- 当前核心目标：`pnpm install` 成功 + 三端各自 `pnpm dev` 可见默认页
- 暂不处理：云函数、路由、页面、认证、支付、数据库、mock

## Checkpoint Summary
- 当前任务理解：pnpm monorepo 初始化 + 3 个 package 骨架
- 当前核心目标：三端 dev server 各自可启动
- 下一步 1：`volta install node@20 && pnpm`
- 下一步 2：创建根目录配置文件
- 下一步 3：创建 `packages/shared`
- 下一步 4：创建 `packages/admin`
- 下一步 5：创建 `packages/app`
- 下一步 6：`pnpm install` + 逐个验证 `pnpm dev`
- 涉及文件/模块：根目录 4 个配置文件 + `packages/` 下 3 个子目录
- 风险：uni-app 模板兼容 pnpm workspace
- 验证方式：浏览器访问各 dev 端口，查看框架默认首页
- Execution Approval: `Pending`

## Change Log
- 2026-05-14: v2.0 — 重写为前后端分离架构，Phase 0 仅关注工程骨架
- 2026-05-14: v2.1 — 社区合并到 uni-app（条件编译 H5 only），admin 采用 vben-admin 框架
- 2026-05-14: v2.2 — 样式方案统一为 UnoCSS（app 端 `@unocss/uni-app` + CSS Variables 主题切换）

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
- 当前状态：Spec 已就绪，待 P0 环境就绪后执行
- 当前卡点：P0-2（Node 20）、P0-3（pnpm）未安装
- 下一步：`volta install node@20 && volta install pnpm`
