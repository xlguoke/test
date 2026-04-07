import type { HumitureRecordDataItem } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 巡查详情 */
export function getHumitureRecordDetail(id: string) {
  return IlisApiHelper.get<HumitureRecordDataItem>(`rest//humiture/record/${id}`)
}
