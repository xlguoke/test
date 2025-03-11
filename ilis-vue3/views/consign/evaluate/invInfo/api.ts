import type { EvaluateInvEntity } from '../inv/EvaluateInvEntity'
import type { EvaluateModelEntity } from '../model/EvaluateModelEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取问卷详情(预委托版)
 */
export function getEvaluateModelDetailPre(obj: EvaluateModelEntity, unitCode: string) {
  return IlisApiHelper.get<EvaluateModelEntity>(`/rest/pre/evaluate/write/${unitCode}/${obj.id}`)
}

/**
 * # 新增评价记录(预委托版)
 */
export function saveEvaluateResult(params: Record<string, any>, unitCode: string) {
  return IlisApiHelper.post<EvaluateModelEntity>(`/rest/pre/evaluate/write/${unitCode}/save`, params)
}
/**
 * # 验证问卷是否在有效期内
 */
export function verifyEvaluate(id: string, unitCode: string) {
  return IlisApiHelper.get<EvaluateInvEntity>(`/rest/pre/evaluate/write/inv/${unitCode}/${id}`)
}
