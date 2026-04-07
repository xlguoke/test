import type { IConsignCustomAttribute, IConsignInfoResDTO } from './consign'

export * from './consign'
export * from './offlineData'

/** ## 委托构造参数 - 查询条件 */
export interface IConsignConstructReqDTO {
  id?: string
  taskId?: string
  testTaskId?: string
  /** ## 委托入口 */
  main?: boolean
  /** ## 任务查看委托详情 */
  taskRedirect?: boolean
  /** ## 审核查看委托详情 */
  auditRedirect?: boolean
  /** ## 批准查看委托详情 */
  approveRedirect?: boolean
}

/** ## 委托构造返回参数 */
export interface IConsignConstructResDTO {
  /** ## 打印配置 */
  printConfig?: IConsignPrintConfigResDTO[]
  /** ## 第三方 */
  thirdPartyBIM?: string
  /** ## 样品所选参数是否有已删除 */
  showDeletedPair?: { [key: string]: boolean }
  /** ## 价格发生变更过 */
  priceChanged?: boolean
  /** ## 费用模型ID */
  priceObjId?: string
  /** ## 撤回意见 */
  withdrawOpinion?: string
  /** ## 委托信息 */
  consignInfo?: IConsignInfoResDTO
  /** ## 委托自定义属性 */
  consignCustomAttributes?: IConsignCustomAttribute[]
  /** ## 允许直接创建原材料试验 */
  directlyBuildRowMaterial?: boolean
  /** ## 委托收费自动挂账 */
  creditCharge?: boolean
  /** ## 是否存在更正报告 */
  hasRevisedReport?: boolean
  /** ## 委托复制为指定检测类型 */
  determineInspect?: string
  /** ## 系统日期 */
  systemDate?: number
  /** ## 检测任务id */
  testTaskId?: string
  /** ## 任务id */
  taskId?: string
  /** ## 任务查看委托详情 */
  taskRedirect?: boolean
  /** ## 审核查看委托详情 */
  auditRedirect?: boolean
  /** ## 批准查看委托详情 */
  approveRedirect?: boolean
}

/** ## 委托构造参数 - 打印配置 */
export interface IConsignPrintConfigResDTO {
  id: number
  name: string
  catalogId?: number
  catalogName?: string
  type: string
  permissionCode?: string
  description?: string
  activated?: boolean
  sequence?: number
}

/** ## 邮寄信息 */
export interface IMailInfoDTO {
  address: string
  receiver: string
  phone: string
  expressCompany: string
  expressCompanyCode: string
  id: string
  infoSubject: string
}

/** ## 检测合同 */
export interface IAppointmentContractDTO {
  id: string
  name: string
  unitCode: string
  sysOrgCode?: string
  bpmStatus?: string
  firstParty?: string
  secondParty?: string
  thirdParty?: string
  no: string
  availabilityDate?: string
  signingDate?: string
  expiryDate?: string
  totalFee: number
  type: string
  feeType: string
  contractType: string
  scope: string
  phone: string
  owner: string
  ownerName: string
  isDelete: string
  status: string
  remarks: string
  content: string
  depositRate?: string
  unitId: string
  unitName: string
  confirmFree: boolean
  autoPaymentDelayed: boolean
  outputAllotType?: string
  outputType: string
  outputAllotStatus?: string
}

/**
 * ## 现场取样信息
 */
export interface IExtractSampleDTO {
  id: string
  createName: string
  createBy: string
  createDate: number
  updateName: string
  updateBy: string
  updateDate: number
  extractedDate: number
  paramIds: string
  paramNames: string
  categoryId: string
  categoryName: string
  categorySampleId: string
  sampleId: string
  testSampleDisplayName: string
  sampleName: string
  standard: string
  delegatesNum: string
  sampleNum: string
  consignCode: string | null
  extractSampleLocation: string | null
  currentLocation: string | null
  extractSampleCode: string
  projectPartAndUse: string
  sampleProcessMethod: string | null
  sampleProcessMethodCode: string | null
  remark: string
  otherInfo: string
  witnessInfo: string
  periods: string
  attachments: string
  proofs: string
  meta: string
  consignMeta: string
  deleted: boolean
  handled: boolean
  rfids: string | null
  examUrl: string | null
  contractPartId: string
  contractPartCode: string
  snCategoryId: string | null
  testObjectId: string | null
  testObjectCode: string | null
}
