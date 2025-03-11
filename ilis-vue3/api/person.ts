import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseOldRowsEntity } from '~/interface/IResponseEntity.ts'

export interface QueryParams {
  page?: number
  size?: number
  department?: string
  queryParam?: string
  equipmentId?: string
}

export interface BiddingCustomizeValueEntity {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: string
  updateName: string
  updateBy: string
  updateDate: string
  unitCode: string
  isDelete: boolean
  columnId: string
  columnIndex: number
  columnName: string
  visible: boolean
  disabled: boolean
  columnType: string
  columnValue?: string
  objectId: string
}

/** 人员信息 */
export interface PersonDataEntity {
  isDelete?: boolean
  identityNumber: string
  gender: string
  dateOfBirth: number
  department: string
  position: string
  jobTitle: string
  entryTime?: string
  personStatus: string
  yearOfWork: string
  education: string
  graduatedSchool: string
  profession: string
  graduatedDate?: string
  contractStartTime?: string
  contractEndTime?: string
  socialSecurityCategory: string
  workRecord?: string
  personName: string
  archiveStatus: string
  id: string
  certificateNames?: string
  certificateIds?: string
  winQuoteNum?: string
  biddingCustomizeValueEntities: BiddingCustomizeValueEntity[]
}

/** 获取人员信息管理列表 */
export function getPerson(queryParams?: QueryParams) {
  return IlisApiHelper.get<IResponseOldRowsEntity<PersonDataEntity>>('biddingPersonController/dataGrid.do', queryParams)
}
