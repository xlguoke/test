import type { ArchiveManageEntity } from './ArchiveManageEntity'

/**
 * # 归档管理列表响应实体 📋
 */
export class ArchiveManageListResponse {
  /** 总条数 */
  total!: number

  /** 数据列表 */
  rows!: ArchiveManageEntity[]

  /** 消息 */
  msg?: null

  /** 底部数据 */
  footer?: null
}
