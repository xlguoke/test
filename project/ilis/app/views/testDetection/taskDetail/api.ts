import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface Params {
  id: string
  paramName: string
}
export interface Standard {
  id: string
  standardName: string
  standardPublishCode: string
}
export interface Person {
  id: string
  personName: string
}
export interface Equipments {
  id: string
  equipmentName: string
  equipmentCode: string
}

/** 样品制备：获取制备信息 */
export function sp_getData(taskId: string) {
  return IlisApiHelper.get<any>(`rest/sample/preparation/data?taskId=${taskId}`)
}

/** 样品制备：获取制备详情 */
interface IDetailData {
  id: string
  taskId: string
  preparationDate: string
  params: Params[]
  standards: Standard[]
  persons: Person[]
  equipments: Equipments[]
  description: string
}
export function sp_getDetailData(id: string) {
  return IlisApiHelper.get<IDetailData>(`rest/sample/preparation?id=${id}`)
}

/** 样品制备：获取检测参数 */
export function sp_getParams(taskId: string) {
  return IlisApiHelper.get<any>(`rest/sample/preparation/params?taskId=${taskId}`)
}

/** 样品制备：获取制备人员 */
export function sp_getPersons(taskId: string) {
  return IlisApiHelper.get<any>(`rest/sample/preparation/persons?taskId=${taskId}`)
}

/** 样品制备：新增 */
export interface IAdd {
  id?: string
  taskId: string
  preparationDate: string
  paramIds: string[]
  standardIds: string[]
  personIds: string[]
  equipmentIds: string[]
  description?: string
}
export function sp_add(data: IAdd) {
  return IlisApiHelper.post<any>(`rest/sample/preparation`, data)
}

/** 样品制备：更新 */
export function sp_update(data: IAdd) {
  return IlisApiHelper.put<any>(`rest/sample/preparation`, data)
}

/** 样品制备：删除 */
export function sp_delete(id: string) {
  return IlisApiHelper.delete<any>(`rest/sample/preparation?id=${id}`)
}
