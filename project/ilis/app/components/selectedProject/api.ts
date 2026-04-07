import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface ProjectData {
  id: string
  name: string
  projectCode: string
  constructionUnitName: string
  buildUnitName: string
  buildProjectName: string
  witnessUnitName: string
  remark: string
  isSynthesisProject: string
  description: string
  province: string
  is_completed?: string
  departIds?: string
  buildUnitWitness?: string
  witness?: string
  city: string
  area: string
  reportDocuments: boolean
  projectAddress: string
  highwayLevel: string
  priceStandardId: string
  priceStandard: string
  qdmSubDomain: string
  projectNature: string
  cooperativeUnit: string
  signReceiveType?: string
  payUnitName: string
  payUnitCode: string
  buildUnitWitnessNum: string
  buildUnitWitnessPhone: string
  supervisorWitnessNum: string
  supervisorWitnessPhone: string
  acceptor: string
  participantUserIds?: string
  principalUserIds?: string
}

interface QueryParam {
  /** 模糊查询 */
  quickQryParam?: string
}

export function getPageListApi(params: QueryParam) {
  return IlisApiHelper.postForm<{ rows: ProjectData[] }>(`projectController.do?datagridNew`, params)
}
