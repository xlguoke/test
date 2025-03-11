import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'

/** 删除 巡查 */
export function deleteHumitureRecord(id: string) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>(`rest/humiture/record/${id}`)
}
