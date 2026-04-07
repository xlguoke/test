import type { ArchiveDepositEntity } from './ArchiveDepositEntity'

/**
 * # 归档存放表单数据接口 📋
 */
export interface IArchiveDepositForm {
  /** 归档日期 */
  archiveDate: string
  /** 归档人员名称 */
  archivePersonName: string
  /** 存放方式: 0=统一存放, 1=分开存放 */
  saveType: string
  /** 档案编号（统一存放时使用） */
  archiveSn?: string
  /** 归档地址ID（统一存放时使用） */
  archiveSiteId?: string
  /** 归档地址名称（统一存放时使用） */
  archiveSiteName?: string
}

/**
 * # 归档资料项接口 📋
 */
export interface IArchiveMaterialItem {
  /** 资料ID */
  id: string
  /** 资料名称 */
  name: string
  /** 是否选中 */
  checked: boolean
}

/**
 * # 系统预定义归档数据接口 📋
 */
export interface ISystemArchiveData {
  /** 类型: 1=检测报告, 2=委托单, 3=原始记录单, 4=任务分配单 */
  type: string
  /** 类型名称 */
  typeName: string
  /** 关联编号集合 */
  codes: string
  /** 总数 */
  total: number
  /** 档案编号 */
  archiveSn?: string
  /** 归档地址ID */
  archiveSiteId?: string
  /** 归档地址名称 */
  archiveSiteName?: string
  /** 关联对象ID */
  relatedObjectId?: string
  /** 关联对象编号 */
  relatedObjectSn?: string
}

/**
 * # 自定义归档项接口 📋
 */
export interface ICustomArchiveItem {
  /** 唯一标识 */
  key: string
  /** 资料名称 */
  typeName: string
  /** 档案编号 */
  archiveSn?: string
  /** 归档地址ID */
  archiveSiteId?: string
  /** 归档地址名称 */
  archiveSite?: string
}

/**
 * # 归档保存参数接口 📋
 */
export interface IArchiveSaveParam {
  /** 报告ID列表 */
  reportIds: string[]
  /** 归档日期 */
  archiveDate: string
  /** 归档人员名称 */
  archivePersonName: string
  /** 归档人员ID */
  archivePersonId?: string
  /** 存放方式 */
  saveType: string
  /** 档案编号（统一存放） */
  archiveSn?: string
  /** 归档地址ID（统一存放） */
  archiveSiteId?: string
  /** 归档明细列表 */
  archiveList: ArchiveDepositEntity[]
  /** 选中的归档资料ID列表 */
  archiveMaterialIds: string[]
}
