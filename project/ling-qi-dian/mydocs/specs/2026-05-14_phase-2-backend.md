# Spec: Phase 2-B — 后端开发（建表 → 云函数 → 平台对接）

> 本阶段基于 Phase 1 的 DB Schema + API Contracts 文档，实现全部后端逻辑。
> 依赖 P2 级前置条件（uniCloud 账号、公众号凭证、收钱吧凭证）。

## Goal
- 要解决的问题：数据库不存在、云函数不存在、第三方平台未对接
- 验收结果：全部 30 个云函数可通过 HTTP 客户端调用并返回正确数据，收钱吧支付可走通沙箱

## Done Contract
- 完成定义：
  - uniCloud 服务空间绑定到 `h5-drink` 项目
  - 全部 9 个 MongoDB 集合创建完毕，索引就位
  - uni-id 配置就绪，`uni-id-users` 表自动初始化
  - 按模块完成 30 个云函数开发，响应格式符合 API Contracts
  - 收钱吧支付可走通（签名验证、统一下单、回调验签）
  - 微信网页授权云函数（wx-auth）可用：code → openid → uni-id 登录 → token
  - 后台管理独立认证体系可用（admin-login → JWT → 校验中间件）
  - 云函数环境变量配置完毕（AppID、AppSecret、收钱吧凭证、JWT 密钥等）
- 证明来源：Postman/curl 逐个调用云函数 URL，返回数据格式与 API Contracts 一致
- 仍未完成的情况：云函数返回 500、签名验证失败、数据库集合缺失、环境变量未配置

## Scope
- In:
  - **uniCloud 初始化**：
    - 创建/关联阿里云服务空间
    - 在 `packages/h5-drink/` 下创建 `uniCloud-aliyun/` 目录结构
    - 配置 `manifest.json` 关联 SpaceId
  - **数据库集合创建（9 个）**：

    | 集合 | 用途 | 关键索引 |
    |---|---|---|
    | `members` | 会员表 | `{ _id: 1 }`，关联 uni-id-users |
    | `point_logs` | 积分流水 | `{ member_id: 1, create_time: -1 }` |
    | `goods` | 商品表 | `{ category: 1, status: 1 }` |
    | `orders` | 订单表 | `{ member_id: 1, create_time: -1 }`，`{ order_no: 1 }` unique |
    | `community_posts` | 社区帖子 | `{ create_time: -1 }`，`{ author_id: 1 }` |
    | `community_comments` | 评论 | `{ post_id: 1, create_time: 1 }` |
    | `community_likes` | 点赞 | `{ post_id: 1, user_id: 1 }` unique |
    | `admin_users` | 后台账号 | `{ username: 1 }` unique |
    | `cashier_sessions` | 收银会话 | `{ create_time: -1 }` |

  - **uni-id 配置**：
    - 引入 uni-id 官方云函数公共模块
    - 配置微信登录（AppID + AppSecret）
    - 业务用户信息存入 `members` 扩展表
  - **云函数开发（30 个，按模块分组）**：

    **认证模块（3 个）**
    | 云函数 | 说明 | 关键逻辑 |
    |---|---|---|
    | `wx-auth` | 微信网页授权 | code→openid→uni-id登录/注册→返回token+uid |
    | `check-token` | Token 校验 | 解析 token→返回用户信息 |
    | `admin-login` | 后台登录 | 账密校验→JWT 签发 |

    **商品模块（3 个）**
    | `goods-list` | 商品列表 | 分类/状态筛选、分页 |
    | `goods-detail` | 商品详情 | 单条查询、含 SKU |
    | `admin-goods-save` | 保存商品 | 新建/编辑、SKU 增删改 |

    **订单+支付模块（4 个）**
    | `order-create` | 创建订单+发起支付 | 校验商品/库存→计算金额→调用收钱吧→返回jsapi参数 |
    | `order-pay-callback` | 支付回调 | 收钱吧验签→更新订单→计算积分→更新会员 |
    | `order-query` | 查单 | 主动查收钱吧订单状态→同步本地 |
    | `admin-orders-detail` | 订单详情 | 完整信息、管理员视角 |

    **订单查询模块（2 个）**
    | `order-list` | 用户订单列表 | 按状态筛选、分页 |
    | `admin-orders-list` | 后台订单列表 | 筛选+分页、含会员信息 |

    **会员模块（5 个）**
    | `member-info` | 会员信息 | 等级/积分/余额/消费/等级名称/权益说明/续期进度 |
    | `member-benefits` | 等级福利配置 | 获取当前等级权益 + 所有等级对比表 |
    | `member-point-logs` | 积分流水 | 分页、按类型筛选 |
    | `member-level-check` | 等级更新 | 根据成长值自动升级（内部调用）|
    | `member-level-progress` | 等级进度 | 返回升级进度、续期进度 |

    **会员充值模块（4 个）**
    | `member-recharge-tiers` | 充值档位列表 | 获取3个档位(¥98/¥980/¥2,980)、计算赠送金额/成长值/积分 |
    | `member-recharge` | 发起充值 | 校验档位→创建充值订单→调用收钱吧→返回jsapi参数 |
    | `member-recharge-callback` | 充值回调 | 收钱吧验签→更新余额→发放成长值和积分→检查等级→记录流水 |
    | `member-recharge-logs` | 充值记录 | 分页查询充值历史 |

    **会员管理模块（3 个）**
    | `admin-members-list` | 会员列表 | 搜索、分页、等级筛选 |
    | `admin-members-detail` | 会员详情 | 完整信息+流水+充值记录 |
    | `admin-point-adjust` | 积分调整 | 增减积分、记录流水（原子操作）|

    **收银模块（3 个）**
    | `cashier-order-create` | 收银下单 | source=cashier、支持 cash/balance/wechat |
    | `cashier-balance-pay` | 余额扣款 | findOneAndUpdate 原子操作 |
    | `member-code-decode` | 会员码解析 | HMAC 验证→返回 member_id |

    **社区模块（6 个）**
    | `community-post-create` | 发帖 | 图文+路线数据、图片云存储上传 |
    | `community-post-list` | 帖子列表 | 时间倒序、分页 |
    | `community-post-detail` | 帖子详情 | 含作者信息 |
    | `community-post-like` | 点赞/取消 | 唯一索引防重 |
    | `community-post-delete` | 删除帖子 | 作者或管理员 |
    | `community-user-posts` | 用户帖子 | 按用户筛选 |

    **评论模块（2 个）**
    | `community-comment-create` | 发表评论 | 关联帖子、更新评论计数 |
    | `community-comment-list` | 评论列表 | 按帖子分页 |

    **后台管理（1 个）**
    | `admin-goods-list` | 后台商品列表 | 含搜索、分页、状态筛选 |

  - **服务层封装（解耦设计，对应方案文档第八章）**：
    - `dbService.js`：封装 MongoDB 操作（`packages/app/uniCloud-aliyun/cloudfunctions/common/dbService.js`）
      - 对外接口：`find()`, `findOne()`, `insert()`, `update()`, `delete()`, `findOneAndUpdate()`
      - 云函数中禁止直接调用 `uniCloud.database()`
      - 未来可替换为：自建 MongoDB / MySQL / PostgreSQL（只需替换 dbService 实现）
    - `paymentService.js`：封装收钱吧 API（`packages/app/uniCloud-aliyun/cloudfunctions/common/paymentService.js`）
      - 对外接口：`createOrder()`, `verifyCallback()`, `queryOrder()`, `refund()`
      - 未来可替换为：微信支付直连 / 支付宝 / 其他聚合支付（只需替换 paymentService 实现）
    - `authService.js`：封装 uni-id 操作（`packages/app/uniCloud-aliyun/cloudfunctions/common/authService.js`）
      - 对外接口：`wxLogin()`, `checkToken()`, `getUserInfo()`, `adminLogin()`
      - 未来可替换为：短信登录 / 邮箱登录 / OAuth（只需替换 authService 实现）
  - **前端 API 层解耦**（`packages/shared/src/api/`）：
    - 统一函数签名，不感知后端实现（Mock / 云函数 URL / REST API）
    - 通过环境变量 `VITE_API_MODE=mock|real` 控制调用方式
    - 未来后端迁移时，前端只需修改 `api/` 模块的调用方式，业务代码零改动
  - **迁移路径准备**：
    - 从 uniCloud 迁移到自建 Node 服务：替换三个 service 文件 + 前端 API 调用方式，业务代码无需改动
    - 预计迁移成本：1 周内完成（基于当前解耦设计）
  - **环境变量配置**（云函数公共配置）：
    - `WX_APPID` / `WX_APPSECRET`
    - `SQB_MERCHANT_NO` / `SQB_APP_ID` / `SQB_APP_KEY`
    - `ADMIN_JWT_SECRET`
    - `MEMBER_CODE_SECRET`（会员码 HMAC 密钥）
    - `CASHIER_PASSWORD_HASH`（收银密码 bcrypt hash）
- Out:
  - 前端页面（Phase 2-F 已完成）
  - 前端 Mock 层切换（Phase 3 联调）
  - 部署上线（Phase 3）
  - 性能优化、缓存策略（后续迭代）

## Facts / Constraints
- 已确认：
  - uniCloud 阿里云版，云函数 Node.js 环境
  - uni-id 作为用户认证基础
  - 收钱吧 JSAPI 支付
- 技术约束：
  - 云函数中禁止直接调用 `uniCloud.database()`（通过 dbService 封装）
  - 支付回调签名验证必须严格按收钱吧文档
  - 积分流水为不可变记录，只追加不修改
  - 余额扣款必须用 `findOneAndUpdate` 原子操作
  - 点赞去重用唯一复合索引
- 已知风险：
  - 收钱吧回调 URL 必须公网可达（需先云函数 URL 化才能配置回调 → 鸡生蛋问题，用主动查单兜底）
  - uniCloud 免费额度数据库 2GB（需定期清理日志或升级）
  - 图片上传需额外配置云存储权限

## 开发顺序

### 第 1 步：uniCloud 初始化 + DB 建表
- 创建服务空间，关联项目
- 创建全量数据库集合 + 索引
- 配置 uni-id

### 第 2 步：认证模块（所有接口的入口依赖）
- `wx-auth` + `check-token` + `admin-login`
- uni-id 联调，确认微信授权链路
- 后台 JWT 签发与校验中间件

### 第 3 步：商品模块
- `goods-list` + `goods-detail` + `admin-goods-list` + `admin-goods-save`
- 插入测试商品数据

### 第 4 步：订单 + 支付模块（核心难点）
- `order-create`（含收钱吧统一下单）
- `order-pay-callback`（签名验证 + 积分计算）
- `order-query`（主动查单兜底）
- 收钱吧沙箱联调

### 第 5 步：会员模块
- `member-info` + `member-benefits` + `member-point-logs` + `member-level-check`
- `admin-members-list` + `admin-members-detail` + `admin-point-adjust`

### 第 5.5 步：会员充值模块
- `member-recharge-tiers` + `member-recharge` + `member-recharge-callback` + `member-recharge-logs`
- 收钱吧充值沙箱联调

### 第 6 步：收银模块
- `cashier-order-create` + `cashier-balance-pay` + `member-code-decode`

### 第 7 步：社区模块
- 帖子 CRUD + 点赞 + 评论 + 云存储上传

## Restated Understanding
- 当前任务：基于设计文档实现全部后端逻辑
- 当前核心目标：34 个云函数 + 11 个集合 + 收钱吧对接完整可用
- 暂不处理：前端联调、部署

## Checkpoint Summary
- 当前任务理解：后端从零开始，先建表后写云函数，最后对接平台 API
- 当前核心目标：所有云函数可通过 HTTP 客户端调通
- 当前进度：依赖 Phase 1 完成 + P2 前置条件就绪
- 开发顺序：uniCloud 初始化→DB建表→认证→商品→订单支付→会员→收银→社区
- 涉及文件/模块：
  - `packages/app/uniCloud-aliyun/` 全量云函数
  - `packages/app/uniCloud-aliyun/cloudfunctions/common/` 服务层（dbService / paymentService / authService）
  - `packages/app/manifest.json` uniCloud 配置
  - `packages/shared/src/api/` 前端 API 层（Mock/Real 切换）
- 风险：收钱吧回调鸡生蛋问题、数据库用量、图片上传权限
- 验证方式：Postman/curl 逐个接口调用 + 收钱吧沙箱支付测试
- Execution Approval: `Pending`

## Change Log
- 2026-05-14: v1.0 — 新增后端独立开发阶段
- 2026-05-14: v1.1 — 补充解耦与迁移设计（四层解耦架构 + 迁移路径 + 前端 API 层热切换）

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
- 当前状态：Spec 已就绪，依赖 Phase 1 完成 + P2 前置条件就绪
- 当前卡点：Phase 1（设计文档）未执行，P2（uniCloud/公众号/收钱吧）未就绪
- 下一步：Phase 1 完成后，从 uniCloud 初始化开始
