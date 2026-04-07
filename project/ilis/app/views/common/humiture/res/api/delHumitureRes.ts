import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 温湿度预约删除 */
export function delHumitureRes(id: string) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>(`rest/humiture/res/${id}`)
}
