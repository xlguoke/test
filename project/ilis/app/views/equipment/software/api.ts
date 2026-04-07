import type { SoftwareEntity } from './SoftwareEntity'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取软件分页列表
 */
export function getSoftwareList(query: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<SoftwareEntity>>('rest/software/management/page', query)
}

/**
 * # 获取软件分页列表
 */
export function getSoftwareDetail(data: SoftwareEntity) {
  return IlisApiHelper.get<SoftwareEntity>(`rest/software/management/${data.id}`)
}

/**
 * # 删除软件
 */
export function delSoftware(data: SoftwareEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/software/management/${id}`)
}

/**
 * # 保存软件数据（新增）
 */
export function saveSoftware(data: SoftwareEntity) {
  return IlisApiHelper.post(`rest/software/management`, data)
}

/**
 * # 保存软件数据（编辑）
 */
export function editSoftware(data: SoftwareEntity) {
  return IlisApiHelper.put(`rest/software/management/${data.id}`, data)
}

/**
 * # 启停软件
 */
export function putSoftware(obj: SoftwareEntity) {
  return IlisApiHelper.put<any>(`/rest/software/management/${obj.id}/${obj.status}`)
}
