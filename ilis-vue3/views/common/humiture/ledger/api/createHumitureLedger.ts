import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'

export class CreateHumitureLedgerEntity {
  /**
   * 功能室id
   */
  laboratoryId?: string
  /**
   * 台账结束日期
   */
  ledgerEndDate?: string
  /**
   * 台账开始日期
   */
  ledgerStartDate?: string
  /**
   * 台账名称
   */
  name?: string
}

/** 新增台账 */
export function createHumitureLedger(data: CreateHumitureLedgerEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('rest/humiture/ledger', data)
}
