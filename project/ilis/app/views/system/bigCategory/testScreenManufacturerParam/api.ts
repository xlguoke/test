import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'

/** 获取配置 */
export function getDashboardDefault() {
  return IlisApiHelper.get<IResponseCommonEntity<any>>('/testSampleController/dashboard/default')
}

/** 获取指标列表 */
export function getIndicator(sampleId: string, dateType: string) {
  return IlisApiHelper.get<IResponseCommonEntity<any>>(`/rest/test/dashboard/indicator/${sampleId}/${dateType}`)
}

/** 保存 */
export function saveDashboardDefault(testSampleId: string, indicator: string) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`/testSampleController/dashboard/default/${testSampleId}/${indicator}`)
}
