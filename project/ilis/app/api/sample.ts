import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** # 获取外部样品数据 */
export async function externalObjectApi(params: Record<string, any>) {
  return IlisApiHelper.get<any>(`rest/object/externals`, params)
}

/** # 获取已委托原材料数据 */
export async function consignedSampleApi(params: Record<string, any>) {
  return IlisApiHelper.get<any>(`testObjectController.do?referConsignedSampleDatagrid`, params)
}
