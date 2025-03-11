import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'
import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'

interface TestTaskHumitureEntity {
  houseHumMax: null
  houseTemMax: null
  houseHumMin: null
  boxTemMin: null
  boxTemMax: null
  houseTemMin: null
  boxHumMin: null
  boxHumMax: null
}

/** 试验任务温湿度配置 */
export function getTestTaskHumiture(id: string) {
  return IlisApiHelper.post<IResponseNewRowsEntity<TestTaskHumitureEntity>>(`rest/humiture/res/task/${id}`)
}
