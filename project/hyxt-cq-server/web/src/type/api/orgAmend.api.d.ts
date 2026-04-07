import { NOTE_STATUS, NOTE_TYPE } from "@/views/appPage/orgAmend"

export interface BaseListParam {
  /** 当前页码 */
  current?: number
  /** 条数 */
  size?: number
  /** 模糊查询 */
  q?: string
}

/**
 * 机构更正分页列表参数
 */
export interface ListParam extends BaseListParam {
  /** 状态 */
  status?: NOTE_STATUS
  /** 创建时间 */
  createAtStart?: string
  createAtEnd?: string
  createDate?: string[]
}

interface Attachments {
  id?: string
  name: string
  url: string
  uploadTime?: number
  remark?: string
  /** 自定义类型(同业务下的文件分类,由业务模块自定义) */
  customType?: string
}

interface ProcessPeople {
  id?: string
  /** 流程人员ID */
  orgPersonId: string
  /** 流程人员名称 */
  orgPersonName: string
  /** 流程人员类型 */
  type: NOTE_TYPE
  /** 是否完成 */
  completed?: boolean
  /** 机构信息修改记录ID */
  orgAmendId?: string
}

/**
 * 新增数据
 */
export interface SaveParam {
  id?: string
  orgId: string
  orgName?: string
  amendContent: string[]
  attachments: Attachments[]
  people: ProcessPeople[]
}

/**
 * 新增审核附件
 */
export type AddAuditAttachments = Omit<Attachments, "updateTime">

/**
 * 流程节点人员
 */
export interface ProcessPersonnelData {
  id: string
  name: string
  username: string
  keeper: string
  phone: string
}

/**
 * 办结
 */
export interface AuditParam {
  orgAmendId: string
  opinion: string
  attachments?: Attachments[]
}
