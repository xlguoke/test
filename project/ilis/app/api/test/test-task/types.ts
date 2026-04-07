/**
 * 检测任务列表项
 */
export interface TestTaskListItemDTO {
  standard: string
  existAiInput: string
  processStatus: string
  agePeriod: string | null
  workflowStatus: string
  consignId: string
  departmentId: string
  resNum: number
  signDate: string
  rid: string
  reportReviseStatus: number
  testObjectId: string
  projectPartAndUse: string
  id: string
  departName: string
  requireReportDate: string | null
  consignType: string
  testRecordCode: string
  projectNames: string
  needMergeReport: boolean
  currentUserSign: string
  recentModifyDate: string
  consignDate: string
  contractNo: string
  urgentStatus: string
  submitDate: string
  autoIsQualified: string | null
  projectCreator: string
  consignUnitName: string
  hasAppTemp: string
  reportBpmStatus: string
  normFinishTime: string
  testTimeStart: string | null
  projectCode: string
  buildProjectName: string
  reportCode: string
  testTime: string
  testUser: string
  constructionUnit: string
  testTaskCode: string
  internalReportDate: string
  createDate: number
  testPersons: string
  signCanceled: boolean
  assignType: string
  overdueMemo: string | null
  markObjectColorTextIds: string | null
  reportEditor: string | null
  mistakeMemo: string | null
  reportReconfirm: string
  bigType: string
  consignCode: string
  testSampleDisplayName: string
  testObjectCode: string
  buildUnitName: string
}

/**
 * 检测任务详情
 */
export interface TestTaskDetailDTO {
  id: string
  testTaskCode: string
  allocDate: string
  finishDate: string | null
  reportDate: string
  pid: string | null
  status: string
  requireCompletedDate: string | null
  workflowStatus: string
  beenNoticeModify: string
  isQualified: string | null
  testConclusion: string | null
  testConclusionRemark: string | null
  consignInfo: ConsignInfo
  testObjects: TestObject[]
  testTaskPersons: TestTaskPerson[]
  testTaskParams: TestTaskParam[]
  bigType: string
  isDeleted: string
  assignType: string
  needMergeReport: boolean
  testDate: string | null
  testEndDate: string | null
  testConditions: string | null
  internalReportDate: string | null
  reportReviseStatus: number
}

/**
 * 检测参数列表项
 */
export interface TestTaskParamListItemDTO {
  designRequirements: string
  testParamBasisExpireDate: string
  middleResults: string
  testParamStandardNames: string
  displayName: string
  conclusions: string
  remark: string
  checkPoint: number
  testParamBasisNames: string
  equipments: string
  equipmentNextCheckDate: string
  name: string
  testParamStandardExpireDate: string
  nameAndRemark: string
  testParamStandardIds: string
  id: string
  testParamId: string
  taskParamId: string
  testParamBasisIds: string
}

interface ConsignInfo {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: string
  updateName: string
  updateBy: string
  updateDate: string
  consignCode: string
  consignUnit: ConsignUnit
  consignUnitName: string
  consignUnitAddress: string
  project: Project
  metaData: null
  sampleSender: SampleSender
  consignWitnessInfo: unknown[]
  consignWitness: ConsignWitness
  consignCustomAttributes: null
  sampleSenderName: string
  sampleSenderPhone: string
  consignDate: string
  sampleSendDate: string
  sampleSendType: string
  mailPayType: string
  mailOrderNumber: string
  consignBigType: string
  consignType: string
  remark: string
  projectTenderName: string
  sampleSendUnitName: string
  projectPartAndUse: null
  checkTypeId: string
  qualificationTypeId: string
  sampleReceiverName: string | null
  sampleReceiverLicenseNumber: string | null
  invoicingUnitName: string | null
  preConsignCode: string
  paymentUnitName: string
  paymentUnitCode: string
  inspectionUnitName: string | null
  constructionUnitName: string
  appointmentDate: string | null
  isConfidentiality: string
  buildUnitName: string
  witnessUnitName: string | null
  reportHandOverType: number
  reportPrintNum: number
  postFormId: string
  requireReportDate: string | null
  requireReportDays: string | null
  sampleProcessMethod: string | null
  status: string
  rollbackFrom: string | null
  standardProvider: string | null
  snTypeId: string
  testType: string
  testNature: string | null
  bigCategoryId: string
  feeStatus: string
  taskName: string
  sampleSource: string
  sampleSourceCode: string
  deadLineReport: string | null
  deadLineRecord: string | null
  deadLineAssigne: string | null
  manualFeeTotal: number
  noticeObjectId: string | null
  notifyModifyOpinion: string | null
  sampleAcceptorName: string
  sampleAcceptor: string | null
  isSimpleModel: string
  isPreconsign: number
  preConsignId: string
  isDelete: number
  extractSampleId: string
  extractSamplePerson: string
  extractSamplePersonTel: string
  extractSampleUnit: string
  fax: string
  contractId: string | null
  contractName: string | null
  appointContractId: string
  appointContractName: string
  appointContractNo: string
  consignObjectName: string
  unitProjectType: string
  unitProjectObjId: string
  unitProjectName: string
  paramVersionId: string
  randomCode: string
  randomPickup: string
  chargingType: string
  discountRate: number | null
  snPresetMode: string
  sampleReceivedDate: string | null
  highwayLevel: string
  sampleActualReceivedDate: string | null
  attachmentQrKey: string | null
  isSubcontract: boolean
  attachmentList: null
  industryId: string
}

interface ConsignUnit {
  id: string
  name: string
  code: string | null
  qualificationTypeId: string
  payUnitName: string
  payUnitCode: string | null
  contactAddress: string
  remark: string
  isDeleted: string
}

interface Project {
  id: string
  name: string
  buildUnitName: string
  contactPerson: string | null
  contactPhone: string | null
  contactAddress: string | null
  isDeleted: string
  verifyStatus: string
  remark: string
  isSynthesisProject: string
  projectCode: string
  constructionUnitName: string
  buildProjectName: string
  witnessUnitName: string
  province: string
  city: string
  area: string
  description: string
  isCompleted: string | null
  departIds: string
  departNames: string
  buildUnitWitness: string | null
  witness: string | null
  reportDocuments: boolean
  snCode: string | null
  projectAddress: string
  highwayLevel: string
  contractPartName: string | null
  priceStandardId: string
  priceStandard: string
  qdmSubDomain: string
  signReceiveType: string | null
  projectNature: string
  cooperativeUnit: string
  acceptor: string
  payUnitName: string
  payUnitCode: string
  buildUnitWitnessNum: string | null
  buildUnitWitnessPhone: string | null
  supervisorWitnessNum: string | null
  witnessList: unknown[]
  supervisorWitnessPhone: string | null
}

interface SampleSender {
  id: string
  account: string
  name: string
  contactPhone: string
  contactAddress: string | null
  zipCode: string | null
  signatureImageSrc: string | null
  status: string
  verifyStatus: string
}

interface ConsignWitness {
  witness: string
  witnessLicenseNumber: string
  witnessPhone: string
  witnessUnitName: string | null
  buildWitness: string
  buildWitnessLicenseNumber: string
  buildWitnessPhone: string
  buildUnitName: string | null
  isDeleted: string | null
  entityWitness: boolean
  entityBuild: boolean
}

interface TestObject {
  id: string
  testObjectCode: string
  codeArr: CodeArr[]
  consignInfoId: string
  systemTestSampleId: string
  testSampleName: string
  testSampleDisplayName: string
  testUnitTestSampleId: string
  standard: string
  level: string
  testObjectCodes: string | null
  model: string
  specification: string
  label: string
  grade: string
  subProject: string | null
  unitProject: string | null
  projectPartAndUse: string
  part: string | null
  testPart: string
  status: string
  remark: string
  mark: string
  isDeleted: string
  parentSampleId: string
  delegatesNum: string
  description: string
  sampleNum: string
  testVerdict: string | null
  testVerdictRemark: string | null
  isQualified: string | null
  testStartDate: string | null
  testEndDate: string | null
  testConditions: string | null
  multipleCode: string | null
  provideToCustomerSampleCode: string
  provideToCustomerSampleCodes: string | null
  provideToCustomerSampleMultipleCode: string | null
  testObjectParams: TestObjectParam[]
  testObjectOtherInfos: TestObjectOtherInfo[]
  testObjectOtherMaterials: unknown[]
  testObjectUseUdrs: TestObjectUseUdr[]
  testObjectPeriods: unknown[]
  bigCategoryId: string
  needMergeReport: boolean
  isNeedConclusion: boolean
  sampleAmount: number
  samplingDate: string | null
  samplingPlace: string
  samplingCompany: string
  samplingPerson: string
  samplingPersonNumber: string
  objectType: number
  externalInfo: string
  noteworthy: string | null
  specificationConfig: string | null
  consignType: string | null
  repository: string
  retentionHowLong: string | null
  retentionTimeUnit: string
  sampleProcessMethod: string
  sampleProcessMethodCode: string
}

interface CodeArr {
  objectCodeMainBody: string
  objectCodeSuffix: string | null
  testObjectCode: string
}

interface TestObjectParam {
  id: string
  testObjectId: string
  testParamId: string
  isBuildSampleCode: string
  testParamDisplayName: string
  isTempParam: string
  count: number
  shareIdentity: string | null
  price: number
  isDeleted: string
  isLocaleItem: string
  checkPoint: number
  generateAcceptSampleInfoByCount: string | null
  generateProcessObject: boolean
  remark: string
  eqIds: string | null
  testObjectParamUseStandardVOs: string | null
  isOfflineReport: string
  equipmentUseList: string | null
  tstestParamId: string | null
}

interface TestObjectOtherInfo {
  id: string
  testObjectId: string
  attributeId: string
  name: string
  displayName: string
  value: string
  infoType: string
  dataType: string
  systemFieldName: string
  isDeleted: string
  isShowTest: boolean
  isDesignValue: boolean
  customized: boolean
  alias: string | null
  isJoinSpecification: boolean
}

interface TestObjectUseUdr {
  id: string
  testObjectId: string
  templateType: string
  templateId: string
  headHorizontalId: string | null
  headVerticalId: string | null
  tailHorizontalId: string | null
  tailVerticalId: string | null
  isDeleted: string
  fileType: string
  groupKey: string
  name: string
}

export interface TestTaskPerson {
  id: string
  userId: string
  type: string
  name: string
  userType: number
}

interface TestTaskParam {
  id: string
  testObjectParamId: string
  testParamId: string | null
  testParamDisplayName: string
  chemically: string | null
  testTaskParamUseEquipments: TestTaskParamUseEquipment[]
}

interface TestTaskParamUseEquipment {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: string
  updateName: string | null
  updateBy: string | null
  updateDate: string | null
  testTaskId: string | null
  testTaskParamId: string | null
  testObjectParamId: string | null
  testParamDisplayName: string | null
  equipmentId: string
  equipmentSn: string | null
  equipmentCode: string
  equipmentName: string
  standard: string | null
  startUseTime: string | null
  endUseTime: string | null
  startUseState: string
  endUseState: string
  nextCheckDate: string | null
  userName: string
  userId: string
  remark: string | null
  eqDelete: string | null
  qualificationType: string | null
  dataGatherId: string | null
}
