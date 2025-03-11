import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'

export class SaveParamHumitureEntity {
  /**
   * 主键id,多个用逗号隔开
   */
  ids?: string
  /**
   * 是否需要调养箱
   */
  box = false
  /**
   * 调养箱最高湿度
   */
  boxHumMax?: number
  /**
   * 调养箱最低湿度
   */
  boxHumMin?: number
  /**
   * 调养箱最高温度
   */
  boxTemMax?: number
  /**
   * 调养箱最低温度
   */
  boxTemMin?: number
  /**
   * 是否需要房间
   */
  house = false
  /**
   * 房间最高湿度
   */
  houseHumMax?: number
  /**
   * 房间最低湿度
   */
  houseHumMin?: number
  /**
   * 房间最高温度
   */
  houseTemMax?: number
  /**
   * 房间最低温度
   */
  houseTemMin?: number
}

/**
 * ## 试验温湿度列表
 */
export function saveParamHumiture(data: SaveParamHumitureEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('rest/param/humiture', data)
}
