import type { EqGoOutAuditEntity } from '.'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

interface ListQuery {
  /** 外出申请单号 */
  egressApplySn?: string
  /** 外出申请开始时间 */
  createDateStartStr?: string
  /** 外出申请结束时间 */
  createDateEndStr?: string
  /** 任务编号 */
  testTaskSn?: string
  /** 外出状态 */
  status?: string
  /** 借用人 */
  borrowUser?: string
  /** 工程项目 */
  project?: string
}

/** 工程项目 */
export interface Project {
  egressId: null
  egressApplyId: string
  projectId: string
  projectName: string
  projectCode: string
  objectId: string
  type: string
}

/** 设备 */
export interface Equipment {
  name: string
  equipmentSn: string
  archiveSn: string
  assetSn: string
  status: string
  standard: string
  eqRange: string
  accuracy: string
  nextCheckDate: null
}

/** 附件 */
export interface Attachment {
  attachmentUrl: string
  attachmentTitle: string
  attachmentId: string
}

/** 保存外出申请单 */
export interface SaveData {
  id?: string
  /** 设备ID */
  equipmentIds: string[]
  /** 工程项目ID */
  projectIds?: string[]
  /** 附件ID */
  attachmentIds?: string[]
  /** 设备外出申请单据号 */
  egressApplySn: string
  /** 关联任务编号 */
  testTaskSn?: string
  /** 借用人 */
  borrowUser?: string
  /** 借用人ID */
  borrowUserId?: string
  /** 外出时间 */
  egressTime?: string
  /** 预归还时间 */
  expectReturnTime?: string
  /** 备注 */
  remark?: string
}

/** 更新设备 */
export interface UpdateParam {
  /** 外出申请ID */
  id: string
  /** 设备ID */
  equipmentIds: string[]
}

/** 详情 */
export interface DetailData extends Required<Omit<SaveData, 'equipmentIds' | 'projectIds' | 'attachmentIds'>> {
  projects: Project[]
  equipments: Equipment[]
  attachments: Attachment[]
}

/**
 * 外出申请分页查询
 */
export function pageListApi(params: ListQuery) {
  return IlisApiHelper.get<any>('rest/eq/egress/apply/list', params)
}

/**
 * 导出
 */
export const exportApiUrl = 'rest/eq/egress/apply/export'
export function exportApi(params: ListQuery) {
  return IlisApiHelper.get<any>(exportApiUrl, params)
}

/**
 * 获取外出申请单号
 */
export function getEgressApplySn() {
  return IlisApiHelper.get<any>('rest/eq/egress/apply/generate/sn/placeholder')
}

/**
 * 外出申请详情
 */
export function detailApi(egressApplyId: string) {
  return IlisApiHelper.get<any>(`rest/eq/egress/apply/detail/${egressApplyId}`)
}

/**
 * 外出申请删除
 */
export function deleteApi(params: EqGoOutAuditEntity[]) {
  const id = params[0].id
  return IlisApiHelper.delete<any>(`rest/eq/egress/apply/${id}`)
}

/**
 * 新增、修改外出申请
 */
export function saveApi(data: SaveData) {
  const method = data.id ? 'put' : 'post'
  return IlisApiHelper[method]<any>('rest/eq/egress/apply', data)
}

/**
 * 外出申请提交审核
 */
export function auditApi(data: any) {
  return IlisApiHelper.postForm<any>('rest/eq/egress/apply/submit/audit', data)
}

/**
 * 外出申请撤回
 */
export function recallApi(data: { id: string, recallDesc: string }) {
  return IlisApiHelper.post<any>(`rest/eq/egress/apply/recall`, data)
}

/**
 * 外出申请添加设备
 */
export function addEquipmentApi(data: UpdateParam) {
  return IlisApiHelper.post<any>('rest/eq/egress/apply/add/eqs', data)
}

/**
 * 外出申请移除设备
 */
export function removeEquipmentApi(data: UpdateParam) {
  return IlisApiHelper.delete<any>('rest/eq/egress/apply/remove/eqs', { data })
}

/**
 * 查询设备
 */
export function queryEquipmentApi(mixCode: string) {
  return IlisApiHelper.get<any>(`rest/equipment/getEquipmentByMixCode?mixCode=${mixCode}`)
}
