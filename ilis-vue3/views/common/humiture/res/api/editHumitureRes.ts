import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'
import type { CreateHumitureResEntity } from '~/views/common/humiture/res/api/createHumitureRes.ts'

/** 温湿度预约编辑 */
export function editHumitureRes(id: string, data: CreateHumitureResEntity) {
  return IlisApiHelper.put<IResponseCommonEntity<any>>(`rest/humiture/res/${id}`, {
    ...data,
    testParams: data.testParams ? data.testParams.join(',') : '',
  })
}
