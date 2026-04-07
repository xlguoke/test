import type { OperationEntity } from './OperationEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

// eslint-disable-next-line unused-imports/no-unused-vars
const listData = {
  standard: '20260312001',
  reason: null,
  buyDepartName: null,
  returnStatus: '1',
  requiredDate: null,
  borrowUserId: '8a8ab0b246dc81120146dc8181950052',
  sysCompanyCode: 'A03',
  equipmentId: '402882c19cdf9f15019cdfe8a25b01c8',
  archiveSn: '20260312001',
  isExtension: null,
  transitionOriginId: '4028b2429cdfe7f3019ce0073ab2006e',
  assetSn: null,
  eqStatus: '正常',
  unitCode: 'gfzx',
  returnRemark: null,
  equipmentName: '20260312001',
  id: '4028b2429cdfe7f3019ce007a61b0092',
  egressApplyId: '4028b2429cdfe7f3019ce007a1f6008f',
  qualificationTypeName: '',
  beforeStatus: '',
  updateName: '管理员',
  returnTime: 1773285542000,
  expectReturnTime: 1773285120000,
  egressTime: 1773285113000,
  egressAuditUser: '管理员',
  sysOrgCode: null,
  projectName: '',
  projectId: null,
  createName: '管理员',
  status: '10',
  updateDate: 1773285773000,
  customizeValues: [],
  returnPerson: '管理员',
  eqId: '402882c19cdf9f15019cdfe8a25b01c8',
  remark: null,
  equipmentSn: '20260312001',
  engineeringField: null,
  qualificationType: '',
  borrowUser: '管理员',
  projectCode: null,
  updateBy: 'admin',
  testTaskSn: null,
  borrowTime: null,
  createDate: 1773285123000,
  expectBorrowTime: null,
  egressApplySn: null,
  applyReason: null,
  returnAuditUser: '管理员',
  borrowDepartment: null,
  createBy: 'admin',
  location: null,
  transitionStatus: 'NO',
}

export type EqEgressList = typeof listData

interface ConfirmInfo {
  id: string
  operator: string
  operatorId: string
  operationTime: string
  remark: string
  attachmentIds: []
}

interface ApplyInfo {
  id: string // 外出记录id
  testTaskSn: string // 任务编号
  attachmentIds: []
  beforeStatus: string
  borrowUser: string
  borrowUserId: string
  egressTime: string
  expectReturnTime: string
  projectName: string
  remark: string
}
/**
 * # 修改确认信息
 */
export function editConfirmInfo(data: ConfirmInfo) {
  return IlisApiHelper.put(`rest/eqEgress/update/operation/${data.id}`, data)
}

export function editApplyInfo(data: ApplyInfo) {
  return IlisApiHelper.put(`rest/eqEgress/update/egress/${data.id}`, data)
}

export function queryQualificationApi(isDeleted?: any) {
  return IlisApiHelper.get<any>(`rest/common-body/qualification/pagination`, {
    isDeleted,
    size: 999,
  })
}

/** # 获取审核通过的转交申请记录 */
export function getTransitionRecordApi(id: string) {
  return IlisApiHelper.get<any>(`rest/eqEgress/${id}/transition-record`)
}

/** # 批量操作 */
export function operationApi(data: {
  ids: string[]
  operation: OperationEntity
}) {
  return IlisApiHelper.put(`rest/eqEgress/batch-operation`, data)
}

/** # 拒绝其他转场申请 */
export function rejectOtherApplyApi(id: string) {
  return IlisApiHelper.post(`rest/eq/egress/apply/${id}/return-operation`)
}

/** # 设备外出记录详情 */
export function detailApi(id: string) {
  return IlisApiHelper.get<any>(`/rest/eqEgress/egressDetail`, { id })
}

/** # 设备外出记录详情-批量 */
export function detailBatchApi(ids: string[]) {
  return IlisApiHelper.post<any>(`/rest/eqEgress/detail-batch`, { ids })
}

/** 批量作废其余申请 */
export function rejectOtherApplyBatchApi(ids: string[]) {
  return IlisApiHelper.post(`rest/eq/egress/apply/return-operation-batch`, { ids })
}
