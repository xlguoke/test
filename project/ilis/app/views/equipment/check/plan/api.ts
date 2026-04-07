import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取检校计划分页列表
 */
export function getCheckPlanList(obj: Record<string, any>) {
  return IlisApiHelper.postForm<any>(`checkPlanController.do?datagrid`, obj)
}
