import type { StandardMaterialAccountEntity } from './StandardMaterialAccountEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取规程资料台账分页列表
 */
export function getStandardMaterialAccountPage(obj: Record<string, any>) {
  return IlisApiHelper.get<{ count: number, rows: StandardMaterialAccountEntity[], total: number }>('rest/standardBookStoreController/in-out-ledger', obj)
}
