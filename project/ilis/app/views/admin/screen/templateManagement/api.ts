import type { ScreenTemplateEntity } from './ScreenTemplateEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取智慧屏模板分页列表(传入isPager:false时不分页)
 */
export function getScreenTemplateList(query: Record<string, any>) {
  return IlisApiHelper.get<IPageModel<ScreenTemplateEntity>>('rest/smart-screen/template/pager', query)
}

/**
 * # 获取智慧屏模板详情
 */
export function getScreenTemplateDetail(id: string) {
  return IlisApiHelper.get<ScreenTemplateEntity>(`rest/smart-screen/template/${id}`)
}

/**
 * # 新增智慧屏模板数据
 */
export function addScreenTemplate(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/smart-screen/template/add`, data)
}

/**
 * # 编辑智慧屏模板数据
 */
export function editScreenTemplate(data: Record<string, any>) {
  return IlisApiHelper.post(`rest/smart-screen/template/edit`, data)
}

/**
 * # 删除智慧屏模板数据
 */
export function delScreenTemplate(data: ScreenTemplateEntity[]) {
  const id = data?.map(item => item.id).join(',')
  return IlisApiHelper.delete(`rest/smart-screen/template/delete/${id}`)
}
