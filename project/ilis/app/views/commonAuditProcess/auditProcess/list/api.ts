import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 获取转交权限人员集合 */
export async function getTransferUser(taskIds: string) { // 审核任务ids
  return await IlisApiHelper.get<any>(`/rest/auditProcess/getTransferAvailableUserTree?taskIds=${taskIds}`)
}

/** 审核转交 */
export async function auditTransfer(params: ProcessForm) {
  return await IlisApiHelper.postForm<any>(`/commonController.do?taskTransfer=`, { ...params, type: 'auditTask' })
}

export async function getProcess(processInstanceId: string) {
  return await IlisApiHelper.get<any>(`/rest/auditProcess/progress/${processInstanceId}`)
}

interface ProcessForm {
  /** 任务ID列表 */
  objectIds: string
  /** 目标用户列表 */
  userIds: string
  /** 审核转交类型 */
  /** 转交意见 */
  comment: string

}
