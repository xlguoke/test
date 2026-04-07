import type { IndustryLayoutConfig, LAYOUT_FORM_TYPE, OldLayoutConfig } from './types'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 获取原委托布局 */
export function getOldLayoutConfigApi() {
  return IlisApiHelper.get<OldLayoutConfig[]>('systemController/getConsignInfoLayoutTemplate.do')
}

/** 获取新委托布局 */
export function getLayoutConfigApi(layoutFormType: LAYOUT_FORM_TYPE) {
  return IlisApiHelper.get<{ id: string, layout: IndustryLayoutConfig[] }>(`rest/consign/layout/${layoutFormType}`)
}

/** 保存委托布局 */
export function saveLayoutConfigApi(data: { id?: string, module: LAYOUT_FORM_TYPE, layout: IndustryLayoutConfig[] }) {
  return IlisApiHelper.post('rest/consign/layout', data)
}

/** 获取待选项 */
export function commonOptionsApi(api: string) {
  return IlisApiHelper.get<any[]>(api)
}
