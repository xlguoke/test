import type { EvaluateRecordEntity } from './EvaluateRecordEntity'
import type { EvaluateRecordDetailEntity } from './EvaluateRecordDetailEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取问卷评价记录分页列表
 */
export function getEvaluateRecordPage(obj: Record<string, any>) {
  if (obj?.createDate?.length) {
    obj.createDateStart = obj.createDate?.[0] || undefined
    obj.createDateEnd = obj.createDate?.[1] || undefined
    delete obj.createDate
  }
  return IlisApiHelper.get<IPageModel<EvaluateRecordEntity>>('/rest/evaluate/record/page', obj)
}

/**
 * # 获取问卷评价记录详情
 */
export function getEvaluateRecordDetail(data: EvaluateRecordEntity) {
  return IlisApiHelper.get<EvaluateRecordDetailEntity>(`rest/evaluate/record/${data.id}`)
}

/**
 * # 处理问卷评价记录
 */
export function handleEvaluateRecord(data: EvaluateRecordEntity) {
  return IlisApiHelper.put<EvaluateRecordDetailEntity>(`rest/evaluate/record/${data.id}/handle`, {
    handleRemark: data.dealWidth,
  })
}
