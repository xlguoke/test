import type { TaskReviewEntity } from './TaskReviewEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface IGetWaitMeReviewListParams {
  quickQryParam?: string
  testPerson?: string
  reviewer?: string
  page?: number
  rows?: number
  type?: string
  queryScope?: string
}
/** # 获取待我审核列表 */
export function getWaitMeReviewList(params: any = {}) {
  const {
    type = '2', // 待我复核
    queryScope = 'user',
    consignDateRange = [],
    testDateRange = [],
    reviewer = '',
    reviewerIds = '',
  } = params
  if (consignDateRange.length > 0) {
    params.consignDateStart = consignDateRange[0]
    params.consignDateEnd = consignDateRange[1]
    delete params.consignDateRange
  }
  if (testDateRange.length > 0) {
    params.testDateStart = testDateRange[0]
    params.testDateEnd = testDateRange[1]
    delete params.testDateRange
  }
  if (reviewer && reviewerIds) {
    params.reviewer = reviewerIds
    delete params.reviewerIds
  }
  delete params.queryScope
  delete params.type
  return IlisApiHelper.post<TaskReviewEntity>(`testTaskController.do?datagrid&dataType=2&type=${type}&queryScope=${queryScope}`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // 请求头
  })
}

export interface OverDueData {
  count: number
  day: number
}
/** # 获取超期未复核信息 */
export function getQryOverdueMsg() {
  return IlisApiHelper.get<{ obj: OverDueData }>('rest/testTaskController/qryOverdueMsg?type=2&dataType=2')
}

export interface ReviewApprovalQueryParams {
  reportId?: string
  testTaskId?: string
  sourceModule?: string
  page?: number
  size?: number
}
/** # 获取复核审批意见信息 */
export function getReviewApprovalOpinionsData(params: ReviewApprovalQueryParams) {
  return IlisApiHelper.get('rest/reportQuestion/list', params)
}

interface SampleInfoQueryParams {
  testTaskId: string
  testObjectId: string
}
export function getSampleInfo(params: SampleInfoQueryParams) {
  return IlisApiHelper.post('testTaskController.do?getGridExtendsData', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
