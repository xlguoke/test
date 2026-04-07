/** ## 见证信息 - 委托单位关联的工程项目信息上勾选的见证信息 */
export interface ISelectedWitness {
  id?: string
  witness: string
  witnessNum?: string
  witnessPhone?: string
  sort?: number
  selected?: boolean
}

/** ## 见证信息 - 工程项目信息上配置的见证信息 */
export interface IProjectWitness extends Omit<ISelectedWitness, 'selected'> {
  /** ## 见证类型 1-建设单位见证信息 2-监理单位见证信息 */
  type: string
  deleted?: string
  constructionUnitName?: string
  witnessUnitName?: string
}

/** ## 工程项目信息 */
export interface IProjectResDTO {
  id: string
  name: string
  buildUnitName?: string
  contactPerson?: string
  contactPhone?: string
  contactAddress?: string
  isDeleted?: string
  verifyStatus?: string
  remark?: string
  isSynthesisProject?: string
  projectCode?: string
  constructionUnitName?: string
  buildProjectName?: string
  witnessUnitName?: string
  province?: string
  city?: string
  area?: string
  description?: string
  isCompleted?: string
  departIds?: string
  departNames?: string
  buildUnitWitness?: string
  witness?: string
  reportDocuments?: boolean
  snCode?: string
  projectAddress?: string
  highwayLevel?: string
  contractPartName?: string
  priceStandardId?: string
  priceStandard?: string
  qdmSubDomain?: string
  signReceiveType?: string
  projectNature?: string
  cooperativeUnit?: string
  acceptor?: string
  payUnitName?: string
  payUnitCode?: string
  buildUnitWitnessNum?: string
  buildUnitWitnessPhone?: string
  supervisorWitnessNum?: string
  witnessList: IProjectWitness[]
  supervisorWitnessPhone?: string
  externalProjectName?: string
  externalProjectId?: string
}

/**
 * ## 委托单位关联信息的工程项目
 * @description 选择委托单位/工程项目时返回的信息，包含工程项目信息和见证信息
 */
export interface IConsignProjectDTO {
  consignUnit: IConsignUnit
  consignProject?: IProjectResDTO
  constructionUnitName: IUnitName[]
  witnessUnitName: IUnitName[]
  witnesses: ISelectedWitness[]
  buildWitnesses: ISelectedWitness[]
  principalUserIds?: any[]
  participantUserIds?: any[]
}

/** ## 委托单位详细信息 */
interface IConsignUnit {
  id: string
  name: string
  code?: string
  qualificationTypeId: string
  payUnitName: string
  payUnitCode?: string
  contactAddress: string
  remark: string
  isDeleted: string
}

interface IUnitName {
  name: string
  selected: boolean
}
