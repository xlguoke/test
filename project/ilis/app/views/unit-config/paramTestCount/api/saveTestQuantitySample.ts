import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'

export interface SaveTestQuantitySampleEntity {
  paramId: string
  testQuantity: number
  sampleId: string
}

/**
 * ## 获取按样品设置的试验数量
 */
export function saveTestQuantitySample(data: SaveTestQuantitySampleEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('rest/test/quantity/sample', data)
}
