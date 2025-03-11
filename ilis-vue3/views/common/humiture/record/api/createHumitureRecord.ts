import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { MStatus, Type } from '~/views/common/humiture/record'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'

export class CreateHumitureRecordEntity {
  /**
   * 湿度
   */
  hum?: number
  /**
   * 湿度状态 OVER超标 NORMAL正常 LOWER过低
   */
  humStatus?: MStatus
  /**
   * 功能室id
   */
  laboratoryId?: string
  /**
   * 记录日期
   */
  recordDate?: string
  /**
   * 温度
   */
  tem?: number
  /**
   * 温度状态 OVER超标 NORMAL正常 LOWER过低
   */
  temStatus?: MStatus
  /**
   * 巡查模式 AUTO自动 MANUAL手动
   */
  type?: Type
}

/** 新增 巡查 */
export function createHumitureRecord(data: CreateHumitureRecordEntity[]) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('rest/humiture/record', data)
}
