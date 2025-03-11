import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import type { ResStatus } from '~/views/common/humiture/res'

interface CancelHumitureResParams {
  id: string
  status: ResStatus
}

/** 温湿度预约取消 */
export function cancelHumitureRes(params: CancelHumitureResParams) {
  return IlisApiHelper.put<IResponseCommonEntity<any>>(`rest/humiture/res/${params.id}/${params.status}`)
}
