import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface LaboratoryList {
  id: string
  name: string
  minTemperature: number
  maxTemperature: number
  minHumidity: number
  maxHumidity: number
  showReallyTH: boolean
  remark: string
  overview: string
  displayScreenNum: string
  applicableParam: string
  isLaboratory: string
  orderNum: number
  basicFuncDesc: string
  equAmount: number
  labDutyPersonId: string
  labDutyPerson: string
  otherLiabilityPersons: string
  accessControlEquipmentSn: string
  departIds: string
  departNames: string
  iotEqId: string
}

export function getPageListApi(params: any) {
  return IlisApiHelper.get<{ rows: LaboratoryList[] }>(`rest/laboratoryController?dataGridPage`, params)
}
