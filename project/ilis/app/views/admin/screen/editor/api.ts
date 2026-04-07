import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 自定义组件 */
export interface CustomComponents {
  /** 组件名称 */
  name: string
}
export function customComponentsApi() {
  return IlisApiHelper.get<CustomComponents[]>(`rest/smart-screen/template/lab/custom`)
}
