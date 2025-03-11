import type { EvaluateModelEntity } from './EvaluateModelEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取问卷设置分页列表
 */
export function getEvaluateModelPage(obj: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<EvaluateModelEntity>>('/rest/evaluate/model/page', obj)
}

/**
 * # 获取问卷不分页列表
 */
export function getEvaluateModelListAll(obj?: Record<string, any>) {
  return IlisApiHelper.get<EvaluateModelEntity[]>('/rest/evaluate/model/list', obj)
}

/**
 * # 查询问卷设置 已有的创建人
 */
export function getEvaluateModelUserList() {
  return IlisApiHelper.get<{ createBy: string, createName: string }[]>('/rest/evaluate/model/create/user')
}

/**
 * # 应用到线上
 */
export function putEvaluateModelOnline(obj: EvaluateModelEntity) {
  return IlisApiHelper.put<any>(`/rest/evaluate/model/${obj.id}/${obj.status}`)
}

/**
 * # 删除问卷
 */
export function deleteEvaluateModel(objArr: EvaluateModelEntity[]) {
  const id = objArr.map(item => item.id).join(',')
  return IlisApiHelper.delete<any>(`/rest/evaluate/model/${id}`)
}

/**
 * # 获取问卷详情
 */
export function getEvaluateModelDetail(obj: EvaluateModelEntity) {
  return IlisApiHelper.get<EvaluateModelEntity>(`/rest/evaluate/model/${obj.id}`)
}

/**
 * # 新增问卷
 */
export function addEvaluateModel(obj: EvaluateModelEntity) {
  return IlisApiHelper.post<EvaluateModelEntity>(`/rest/evaluate/model`, obj)
}

/**
 * # 编辑问卷
 */
export function editEvaluateModel(obj: EvaluateModelEntity) {
  return IlisApiHelper.put<EvaluateModelEntity>(`/rest/evaluate/model/${obj.id}`, obj)
}

/**
 * # 复制问卷
 */
export function copyEvaluateModel(obj: EvaluateModelEntity) {
  return IlisApiHelper.put<EvaluateModelEntity>(`/rest/evaluate/model/${obj.id}/copy`, { name: obj.name })
}
