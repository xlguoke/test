import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 删除 巡查 */
export function deleteHumitureRecord(id: string) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>(`rest/humiture/record/${id}`)
}
