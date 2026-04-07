export interface TestObjectDTO {
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
  testObjectOtherMaterials: any[]
  testObjectUseUdrs: TestObjectUseUdr[]
  testObjectPeriods: any[]
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
  noteworthy: boolean
  specificationConfig: string | null
  consignType: string | null
  sampleProcessMethod: string
  sampleProcessMethodCode: string
  retentionHowLong: string
  retentionTimeUnit: string
  repository: string
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
