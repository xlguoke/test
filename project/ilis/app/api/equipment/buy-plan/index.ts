import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * ## 购置计划列表
 */
export function getBuyPlanList(query: {
  page: number
  rows: number
  quickQryParam?: string
  status?: string
}) {
  return IlisApiHelper.get<any>(`buyPlanController.do?datagrid`, query)
}

/**
 * ## 购置计划明细信息
 */
export function getBuyPlanDetailList(query: { buyPlanId: string }) {
  return IlisApiHelper.get<any>(`buyPlanController.do?datagridPlanDetail`, query)
}
