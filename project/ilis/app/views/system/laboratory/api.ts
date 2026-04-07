import { IlisApiHelper } from '~/utils/IlisApiHelper'

export function getPageList(query: Record<string, any>) {
  return IlisApiHelper.get<any>(`rest/laboratoryController?dataGridPage`, query)
}

export function setPositionCodeBatch(labIds: string[], positionCode: string) {
  return IlisApiHelper.post<any>(`rest/laboratoryController/position-batch-setting`, { labIds, positionCode })
}

export interface ISetTHBach {
  idList: string[]
  minTemperature: number
  maxTemperature: number
  minHumidity: number
  maxHumidity: number
  minTemperatureCon: number
  maxTemperatureCon: number
  minHumidityCon: number
  maxHumidityCon: number
  showReally: boolean
  valueTakeTem: string// AVG平均值MED中位数
  valueTakeHum: string// AVG平均值MED中位数
}

export function setTHBatch(params: ISetTHBach) {
  return IlisApiHelper.post<any>(`rest/laboratory/controller/huniture/config`, params)
}
