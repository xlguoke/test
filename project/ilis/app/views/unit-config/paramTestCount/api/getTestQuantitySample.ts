import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'

export interface GetTestQuantitySampleQuery {
  /** 大类id */
  bigCategoryId: string
  /** 参数 ID */
  paramId: string
}

export interface TestQuantitySampleDTO {
  id: string
  pid: string
  name: string
  displayName: string
  quantityId: string
  quantity: number
  children: TestQuantitySampleDTO[]
}

/**
 * ## 获取按样品设置的试验数量
 */
export function getTestQuantitySample(params: GetTestQuantitySampleQuery) {
  return IlisApiHelper.get<IResponseNewRowsEntity<TestQuantitySampleDTO[]>>('rest/test/quantity/sample', params)
}
