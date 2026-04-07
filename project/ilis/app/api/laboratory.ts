import type { IResponseOldRowsEntity } from '~/interface/IResponseEntity.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface QueryParams {
  page?: number
  size?: number
  name?: string
  isIotLab?: 1
  isAuth?: 2 // 新增功能室权限控制
}

/** 功能室数据 */
export interface LaboratoryDataEntity {
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
  [key: string]: any
}

/** 获取功能室数据 */
export function getLaboratoryData(queryParams?: QueryParams) {
  const data = { ...queryParams }

  if (!queryParams || (!queryParams.page && !queryParams.size)) {
    data.page = 1
    data.size = 999
  }

  return IlisApiHelper.get<IResponseOldRowsEntity<LaboratoryDataEntity>>('/rest/laboratoryController?dataGridPage', data)
}
