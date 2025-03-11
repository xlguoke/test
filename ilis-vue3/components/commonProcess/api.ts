import type { IProcessFormConfig, IProcessUserNode, ProcessType } from '.'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取是否配置审批流程(未配置会完成审批)
 */
export function preSubmitProcess(processType: ProcessType, processId: string) {
  return IlisApiHelper.get<{ haveProcess: boolean }>(`/rest/auditProcessRelation/preSubmit/${processType}/${processId}`)
}

/**
 * # 获取是否配置审批流程(未配置不会完成审批)
 */
export function preCheckProcess(businessType: ProcessType) {
  return IlisApiHelper.get<{ haveProcess: boolean }>(`/rest/auditProcessRelation/check/${businessType}`)
}

/**
 * # 获取审批人员
 */
export function getProcessUser(processType: ProcessType) {
  return IlisApiHelper.get<IProcessUserNode[]>(`/rest/auditProcess/getProcessUserTaskList`, {
    auditTypeId: processType,
  })
}

/**
 * # 获取审批表单
 */
export function getProcessForm(processType: ProcessType) {
  return IlisApiHelper.get<IProcessFormConfig[]>(`/rest/auditProcess/getStartFormData`, {
    auditTypeId: processType,
  })
}
