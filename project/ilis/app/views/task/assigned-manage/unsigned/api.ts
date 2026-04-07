import type { TaskUnAssignedManageEntity } from './TaskUnAssignedManageEntity.ts'
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
  if (query.consignDate?.length) {
    query.consignDate = query.consignDate.join(' ~ ')
  }
  return IlisApiHelper.post<IPageModel<TaskUnAssignedManageEntity>>('unAssignedTaskController.do?datagrid', query, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

/**
 * # 获取超期数据
 */
export function getOverdueMsg() {
  return IlisApiHelper.get<{ attributes: OverDueData }>('unAssignedTaskController.do?qryOverdueMsg')
}
