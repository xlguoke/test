import { IlisApiHelper } from '~/utils/IlisApiHelper'

interface TestParamDTO {
  id: string
  displayName: string
}

export interface ParamHumConfigDTO {
  houseHumMax: number | null
  houseTemMax: number | null
  houseHumMin: number | null
  boxTemMin: number | null
  boxTemMax: number | null
  testParamId: string
  houseTemMin: number | null
  boxHumMin: number | null
  boxHumMax: number | null
}

/** 获取试验任务下检测参数配置的温湿度 */
export function getHumitureTestParamConfig(labId: string, taskId: string) {
  return IlisApiHelper.post<{
    paramList: TestParamDTO[]
    paramHumConfig: ParamHumConfigDTO[]
  }>(`rest/humiture/res/${labId}/${taskId}/param/config`)
}
