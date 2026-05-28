# 解耦与迁移设计文档

> 本文档定义系统的解耦架构设计，确保未来可平滑迁移至独立部署
> 版本: v1.0 | 日期: 2026-05-22

---

## 目录

1. [设计目标](#设计目标)
2. [架构解耦策略](#架构解耦策略)
3. [分层架构设计](#分层架构设计)
4. [数据访问层设计](#数据访问层设计)
5. [服务层设计](#服务层设计)
6. [迁移路径规划](#迁移路径规划)
7. [技术债务控制](#技术债务控制)

---

## 设计目标

### 1. 当前架构（uniCloud 云函数）

```
┌─────────────────────────────────────────┐
│              前端三端                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 点单端  │ │ 社区端  │ │ 后台管理 │  │
│  └────┬────┘ └────┬────┘ └────┬────┘  │
└───────┼───────────┼───────────┼───────┘
        │           │           │
        └───────────┼───────────┘
                    ▼
┌─────────────────────────────────────────┐
│           uniCloud 服务层               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 云函数  │ │ 云数据库 │ │ 云存储  │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
```

### 2. 目标架构（独立部署）

```
┌─────────────────────────────────────────┐
│              前端三端                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 点单端  │ │ 社区端  │ │ 后台管理 │  │
│  └────┬────┘ └────┬────┘ └────┬────┘  │
└───────┼───────────┼───────────┼───────┘
        │           │           │
        └───────────┼───────────┘
                    ▼
┌─────────────────────────────────────────┐
│              API 网关                   │
│         (Nginx / Kong / Traefik)        │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│              业务服务层                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 会员服务 │ │ 订单服务 │ │ 商品服务 │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 社区服务 │ │ 支付服务 │ │ 通知服务 │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│              数据层                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ MongoDB │ │  Redis  │ │  OSS    │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
```

### 3. 解耦原则

| 原则 | 说明 | 实践 |
|:---|:---|:---|
| **依赖倒置** | 高层模块不依赖低层模块 | 通过接口/抽象类定义依赖 |
| **单一职责** | 每个模块只做一件事 | 云函数按业务域拆分 |
| **接口隔离** | 客户端不依赖不需要的接口 | API 按版本管理 |
| **数据独立** | 每个服务管理自己的数据 | 集合访问通过 Repository 层 |

---

## 架构解耦策略

### 1. 前后端解耦

**当前**: 前端直接调用 uniCloud 云函数
**目标**: 前端调用 RESTful API，不关心后端实现

**实现方式**:
```typescript
// packages/shared/src/api/client.ts
// 统一 API 客户端，屏蔽底层实现

interface ApiClient {
  get<T>(url: string, params?: object): Promise<ApiResponse<T>>
  post<T>(url: string, data?: object): Promise<ApiResponse<T>>
  put<T>(url: string, data?: object): Promise<ApiResponse<T>>
  delete<T>(url: string): Promise<ApiResponse<T>>
}

// uniCloud 实现
class UniCloudClient implements ApiClient {
  async post<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    return await uniCloud.callFunction({
      name: url,
      data
    })
  }
}

// HTTP 实现（未来迁移用）
class HttpClient implements ApiClient {
  async post<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    return await fetch(`/api/${url}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(r => r.json())
  }
}
```

### 2. 业务逻辑解耦

**分层架构**:
```
Controller (云函数入口)
    ↓
Service (业务逻辑)
    ↓
Repository (数据访问)
    ↓
Database (MongoDB)
```

**目录结构**:
```
uniCloud/cloudfunctions/
├── common/                 # 共享代码
│   ├── repository/        # 数据访问层
│   │   ├── member.repo.ts
│   │   ├── order.repo.ts
│   │   └── goods.repo.ts
│   ├── service/           # 业务逻辑层
│   │   ├── member.service.ts
│   │   ├── order.service.ts
│   │   └── goods.service.ts
│   └── utils/             # 工具函数
├── member/                # 会员相关云函数
│   ├── info/
│   ├── benefits/
│   └── points/
├── order/                 # 订单相关云函数
│   ├── create/
│   ├── list/
│   └── detail/
└── ...
```

### 3. 数据访问解耦

**Repository 模式**:
```typescript
// common/repository/base.repo.ts
export abstract class BaseRepository<T> {
  protected collection: string
  
  async findById(id: string): Promise<T | null> {
    return await db.collection(this.collection).doc(id).get()
  }
  
  async findOne(filter: object): Promise<T | null> {
    return await db.collection(this.collection).where(filter).limit(1).get()
  }
  
  async find(filter: object, options?: QueryOptions): Promise<T[]> {
    let query = db.collection(this.collection).where(filter)
    if (options?.sort) query = query.orderBy(options.sort)
    if (options?.skip) query = query.skip(options.skip)
    if (options?.limit) query = query.limit(options.limit)
    return await query.get()
  }
  
  async create(data: Partial<T>): Promise<T> {
    return await db.collection(this.collection).add(data)
  }
  
  async update(id: string, data: Partial<T>): Promise<T> {
    return await db.collection(this.collection).doc(id).update(data)
  }
  
  async delete(id: string): Promise<void> {
    await db.collection(this.collection).doc(id).remove()
  }
}

// common/repository/member.repo.ts
export class MemberRepository extends BaseRepository<Member> {
  constructor() {
    super('members')
  }
  
  async findByLevel(level: number): Promise<Member[]> {
    return this.find({ level })
  }
  
  async updateBalance(memberId: string, amount: number): Promise<void> {
    await this.collection.doc(memberId).update({
      balance: db.command.inc(amount),
      update_time: new Date()
    })
  }
}
```

---

## 分层架构设计

### 1. 云函数层 (Controller)

职责:
- 接收请求参数
- 调用 Service 层
- 返回响应结果
- 异常处理

示例:
```typescript
// cloudfunctions/member/info/index.ts
import { MemberService } from '../../common/service/member.service'

exports.main = async (event: { token: string }) => {
  try {
    const memberService = new MemberService()
    const memberInfo = await memberService.getInfo(event.token)
    
    return {
      code: 0,
      message: 'success',
      data: memberInfo
    }
  } catch (error) {
    return {
      code: error.code || 10005,
      message: error.message,
      data: null
    }
  }
}
```

### 2. 服务层 (Service)

职责:
- 业务逻辑处理
- 事务管理
- 跨集合操作
- 调用 Repository

示例:
```typescript
// common/service/member.service.ts
import { MemberRepository } from '../repository/member.repo'
import { PointLogRepository } from '../repository/point-log.repo'

export class MemberService {
  private memberRepo: MemberRepository
  private pointLogRepo: PointLogRepository
  
  constructor() {
    this.memberRepo = new MemberRepository()
    this.pointLogRepo = new PointLogRepository()
  }
  
  async getInfo(token: string): Promise<MemberInfo> {
    const uid = await this.verifyToken(token)
    const member = await this.memberRepo.findById(uid)
    
    if (!member) {
      throw new Error('MEMBER_NOT_FOUND')
    }
    
    return this.formatMemberInfo(member)
  }
  
  async addPoints(memberId: string, points: number, reason: string): Promise<void> {
    // 使用事务保证一致性
    const transaction = await db.startTransaction()
    
    try {
      // 1. 更新会员积分
      await transaction.collection('members').doc(memberId).update({
        points: db.command.inc(points),
        total_points_earned: db.command.inc(points > 0 ? points : 0),
        update_time: new Date()
      })
      
      // 2. 记录积分流水
      await transaction.collection('point_logs').add({
        member_id: memberId,
        change: points,
        reason,
        create_time: new Date()
      })
      
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
```

### 3. 数据访问层 (Repository)

职责:
- 数据库操作封装
- 查询构建
- 数据转换

### 4. 实体层 (Entity)

职责:
- 数据模型定义
- 类型约束

```typescript
// common/entities/member.entity.ts
export interface MemberEntity {
  _id: string
  nickname: string
  avatar: string
  level: number
  points: number
  balance: number
  create_time: Date
  update_time: Date
}

// 数据库实体 vs DTO 转换
export class MemberMapper {
  static toDTO(entity: MemberEntity): MemberInfo {
    return {
      uid: entity._id,
      nickname: entity.nickname,
      avatar: entity.avatar,
      level: entity.level,
      points: entity.points,
      balance: entity.balance
    }
  }
}
```

---

## 数据访问层设计

### 1. 集合访问矩阵

| 云函数 | members | orders | goods | posts | 说明 |
|:---|:---:|:---:|:---:|:---:|:---|
| member/info | R | - | - | - | 只读会员 |
| member/points | RW | - | - | - | 读写会员+积分流水 |
| order/create | R | RW | R | - | 读会员/商品，写订单 |
| order/list | - | R | - | - | 只读订单 |
| goods/list | - | - | R | - | 只读商品 |
| community/post | R | - | - | RW | 读会员，写帖子 |

### 2. 事务使用规范

**必须使用事务的场景**:
- 积分变动（更新余额 + 记录流水）
- 订单创建（扣减库存 + 创建订单）
- 充值到账（更新余额 + 记录充值）

**事务模板**:
```typescript
async function withTransaction<T>(
  operations: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const transaction = await db.startTransaction()
  
  try {
    const result = await operations(transaction)
    await transaction.commit()
    return result
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
```

---

## 迁移路径规划

### 阶段 1: 代码层解耦 (当前)

目标: 代码结构支持未来迁移

任务:
- [x] 创建 Repository 层
- [x] 创建 Service 层
- [x] 统一 API 客户端
- [x] 类型定义独立

### 阶段 2: 服务拆分 (未来 6-12 个月)

目标: 按业务域拆分为独立服务

```
当前: 34 个云函数
目标: 6 个微服务

- member-service (会员服务)
- order-service (订单服务)
- goods-service (商品服务)
- community-service (社区服务)
- payment-service (支付服务)
- admin-service (后台服务)
```

**拆分策略**:
```typescript
// 当前: 云函数直接操作数据库
// cloudfunctions/member/info/index.ts
exports.main = async () => {
  return await db.collection('members').get()
}

// 未来: 云函数作为 API Gateway，调用独立服务
// cloudfunctions/member/info/index.ts
exports.main = async () => {
  return await fetch('http://member-service:8080/info')
}
```

### 阶段 3: 数据迁移 (未来 12-18 个月)

目标: 数据层独立部署

**迁移步骤**:
1. 数据同步（双写）
2. 灰度切换
3. 下线 uniCloud

```
阶段 3.1: 双写阶段
┌─────────────┐     ┌─────────────┐
│   云函数     │────▶│  uniCloud   │
│             │     │   MongoDB   │
│             │────▶│  自建 Mongo │
└─────────────┘     └─────────────┘

阶段 3.2: 读切换
┌─────────────┐     ┌─────────────┐
│   云函数     │────▶│  uniCloud   │
│   (只写)     │     │   MongoDB   │
│             │────▶│  自建 Mongo │
└─────────────┘     │   (主读)    │
                    └─────────────┘

阶段 3.3: 完全切换
┌─────────────┐     ┌─────────────┐
│   云函数     │────▶│  自建 Mongo │
│   (废弃)     │     │  (主库)     │
└─────────────┘     └─────────────┘
```

---

## 技术债务控制

### 1. 代码规范

```typescript
// ✅ 推荐: 依赖抽象
class OrderService {
  constructor(
    private memberRepo: MemberRepository,
    private orderRepo: OrderRepository
  ) {}
}

// ❌ 避免: 直接依赖具体实现
class OrderService {
  async create() {
    await db.collection('members').get()  // 直接操作数据库
  }
}
```

### 2. 测试策略

| 层级 | 测试类型 | 工具 |
|:---|:---|:---|
| Repository | 集成测试 | jest + 测试数据库 |
| Service | 单元测试 | jest + mock |
| Controller | 接口测试 | 自动化测试脚本 |

### 3. 监控埋点

```typescript
// 关键指标
- API 响应时间
- 错误率
- 数据库查询耗时
- 事务成功率
```

---

## 总结

### 当前行动项

1. **立即执行**: 按 Repository + Service 分层编写云函数
2. **开发规范**: 禁止云函数直接操作数据库，必须通过 Repository
3. **接口定义**: 使用 shared/types 中的类型定义

### 未来迁移成本评估

| 组件 | 迁移成本 | 说明 |
|:---|:---:|:---|
| Repository 层 | 低 | 只需替换数据库连接 |
| Service 层 | 中 | 可能需要拆分为独立服务 |
| Controller 层 | 低 | 可作为 API Gateway 保留 |
| 前端 | 极低 | 通过 ApiClient 抽象，无感知 |

---

*文档结束*
