import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { HumitureRecordDataItem } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'

/** 巡查详情 */
export function getHumitureRecordDetail(id: string) {
  return IlisApiHelper.get<HumitureRecordDataItem>(`rest//humiture/record/${id}`)
}
