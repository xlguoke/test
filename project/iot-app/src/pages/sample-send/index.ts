import { AnyDictionaryHelper } from '@/utils/AnyDictionaryHelper'
import request from '@/utils/request'

/** # 送样类型枚举 */
export enum SampleSendType {
  /** # 立即送样 */
  Direct = 'IMMEDIATE',
  /** # 预约送样 */
  Appointment = 'APPOINTMENT',
  /** # 自行送样 */
  SELF_DELIVERY = 'SELF_DELIVERY',
}

/** # 送样类型字典 */
export const SampleSendTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: SampleSendType.Direct, label: '立即送样（机器人送样）' },
  { key: SampleSendType.Appointment, label: '预约送样（机器人送样）' },
  { key: SampleSendType.SELF_DELIVERY, label: '自行送样（人工自取）' },
])

/** # 新建智能送样任务 */
export function addSampleSendTask(params: Record<string, any>) {
  const apiUrl = 'api/intelligent/sampling'
  return request.post<any>(apiUrl, params)
}
