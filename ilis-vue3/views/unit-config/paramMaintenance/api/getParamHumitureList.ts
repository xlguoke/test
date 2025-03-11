import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'
import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'

export class GetParamHumitureListParams {
  /** 大类id */
  bigCategoryId?: string
  /** 试验参数显示名称 */
  displayName?: string
  /** 试验参数名称 */
  name?: string
}

export interface ParamHumitureDataItem {
  id: '0e8d241dbbe01e2a580a51732dfd91da'
  name: '坍落度' // 试验参数系统名称
  displayName: '坍落度' // 试验参数显示名称
  testItemName: '水泥混凝土拌合物试验'
  remark: '' // 参数备注
  box?: boolean// 是否需要养护
  boxTemMin?: number// 养护温度范围（℃）
  boxTemMax?: number
  boxHumMin?: number// 养护湿度范围（%RH）
  boxHumMax?: number
  house?: boolean// 试验对温湿度是否有要求
  houseTemMin?: number// 试验温度范围（℃）
  houseTemMax?: number
  houseHumMin?: number// 试验湿度范围（%RH）
  houseHumMax?: number
}

/**
 * ## 试验温湿度列表
 */
export function getParamHumitureList(params: GetParamHumitureListParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<ParamHumitureDataItem>>('rest/param/humiture/list', params)
}
