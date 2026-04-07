import type { TaskAssignedManageEntity } from './TaskAssignedManageEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface OverDueData {
  countNotAssign: number
  countPeriod: number
  howLangToAge: number
  overDate: number
}

/**
 * # 获取任务分配管理分页列表
 */
export function getTaskAssignedManageList(query: Record<string, any>) {
  return IlisApiHelper.post<IPageModel<TaskAssignedManageEntity>>('assignedTaskController.do?datagrid', query, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

/** ## 获取领域配置的模板类型 */
export function systemPrintTemplateApi(printType: string) {
  return IlisApiHelper.get<any>(`rest/system/print/template?type=${printType}`)
}
