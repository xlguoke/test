import type { EvaluateInvEntity } from './EvaluateInvEntity'
import type { EvaluateInvUserEntity } from './EvaluateInvUserEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取问卷邀请分页列表
 */
export function getEvaluateInvPage(obj: Record<string, any>) {
  if (obj?.createDate?.length) {
    obj.invStartDate = obj.createDate?.[0]
    obj.invEndDate = obj.createDate?.[1]
    delete obj.createDate
  }
  return IlisApiHelper.get<IPageModel<EvaluateInvEntity>>('/rest/evaluate/inv/page', obj)
}

/**
 * # 获取问卷邀请不分页列表
 */
export function getEvaluateInvListAll(obj: Record<string, any>) {
  return IlisApiHelper.get<EvaluateInvEntity[]>('/rest/evaluate/inv/list', obj)
}

/**
 * # 查询问卷邀请 已有的创建人
 */
export function getEvaluateInvUserList() {
  return IlisApiHelper.get<{ createBy: string, createName: string }[]>('/rest/evaluate/inv/create/user')
}

/**
 * # 新增问卷邀请
 */
export function addEvaluateInv(data: EvaluateInvEntity) {
  return IlisApiHelper.post<any>(`/rest/evaluate/inv`, data)
}

/**
 * # 问卷邀请详情
 */
export function getEvaluateInvDetail(data: EvaluateInvEntity) {
  return IlisApiHelper.get<EvaluateInvEntity>(`/rest/evaluate/inv/${data.id}`)
}

/**
 * # 删除问卷邀请
 */
export function deleteEvaluateInv(objArr: EvaluateInvEntity[]) {
  const id = objArr.map(item => item.id).join(',')
  return IlisApiHelper.delete<any>(`/rest/evaluate/inv/${id}`)
}

/**
 * # 提前结束问卷邀请
 */
export function closeEvaluateInv(obj: EvaluateInvEntity) {
  return IlisApiHelper.put<any>(`/rest/evaluate/inv/${obj.id}/close`)
}

/**
 * # 问卷邀请延期
 */
export function defermentEvaluateInv(obj: EvaluateInvEntity, newDate: string) {
  return IlisApiHelper.put<any>(`rest/evaluate/inv/${obj.id}/deferment`, { newDate })
}

export interface UnitUser {
  [key: string]: any
  id: string
  username: string
}

export interface Unit {
  [key: string]: any
  id: string
  unitName: string
  userList: UnitUser[]
}

/**
 * # 获取全部单位与用户
 */
export function getUnitUserAll(query?: Record<string, any>) {
  return IlisApiHelper.get<Unit[]>(`/consignUnitController.do?getUnitUserAll`, query)
}

/**
 * # 获取单个邀请链接
 */
export function getLink(query: EvaluateInvUserEntity) {
  return IlisApiHelper.get<string>(`rest/evaluate/inv/${query.id}/link`)
}

/**
 * # 导出邀请链接
 */
export function exportAllLink(query: EvaluateInvEntity) {
  return IlisApiHelper.get<any>(`rest/evaluate/inv/${query.id}/export/link`)
}

/**
 * # 重发短信（单个）
 */
export function sendSMS(query: EvaluateInvUserEntity) {
  return IlisApiHelper.get<any>(`rest/evaluate/inv/send/sms`, { ids: query.id })
}

/**
 * # 重发短信（邀请单的所有人）
 */
export function sendEvaluateSMS(query: EvaluateInvEntity) {
  return IlisApiHelper.get<any>(`rest/evaluate/inv/${query.id}/send/sms`)
}
