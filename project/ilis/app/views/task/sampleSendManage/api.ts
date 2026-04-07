import type { SampleSendEntity } from './SampleSendEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取送样任务分页列表
 */
export function getSampleSendList(query: Record<string, any>) {
  if (query.requestDeliveryTimeSearch?.length) {
    query.requestDeliveryTimeStart = query.requestDeliveryTimeSearch[0] || undefined
    query.requestDeliveryTimeEnd = query.requestDeliveryTimeSearch[1] || undefined
    delete query.requestDeliveryTimeSearch
  }
  return IlisApiHelper.get<IPageModel<SampleSendEntity>>('rest/intelligent/sampling/pagination', query)
}

/**
 * # 新建智能送样任务
 */
export function addSampleSendTask(data: Record<string, any>) {
  return IlisApiHelper.post<any>('rest/intelligent/sampling', data)
}

/**
 * # 取消智能送样任务
 */
export function cancelSampleSendTask(data: SampleSendEntity[]) {
  return IlisApiHelper.put<any>(`rest/intelligent/sampling/cancel`, data.map(i => i.id))
}

/**
 * # 确认送达
 */
export function confirmSampleSendTask(data: SampleSendEntity[]) {
  return IlisApiHelper.put<any>(`rest/intelligent/sampling/deliver`, data.map(i => i.id))
}
