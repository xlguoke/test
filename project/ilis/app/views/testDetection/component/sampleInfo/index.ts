export { default as SampleInfo } from './SampleInfo.vue'

export interface TestObjectData {
  id?: string
  testObjectCode?: string
  codeArr?: CodeArr[]
  consignInfoId?: string
  systemTestSampleId?: string
  testSampleName?: string
  testSampleDisplayName?: string
  testUnitTestSampleId?: string
  standard?: string
  level?: string
  testObjectCodes?: null
  model?: string
  specification?: string
  label?: string
  grade?: string
  subProject?: null
  unitProject?: null
  projectPartAndUse?: string
  part?: null
  testPart?: string
  status?: string
  remark?: string
  mark?: string
  isDeleted?: string
  parentSampleId?: string
  delegatesNum?: string
  description?: string
  sampleNum?: string
  testVerdict?: null
  testVerdictRemark?: null
  isQualified?: null
  testStartDate?: null
  testEndDate?: null
  testConditions?: null
  multipleCode?: null
  provideToCustomerSampleCode?: string
  provideToCustomerSampleCodes?: null
  provideToCustomerSampleMultipleCode?: null
  testObjectParams?: TestObjectParam[]
  testObjectOtherInfos?: TestObjectOtherInfo[]
  testObjectOtherMaterials?: any[]
  testObjectUseUdrs?: TestObjectUseUdr[]
  testObjectPeriods?: any[]
  bigCategoryId?: string
  needMergeReport?: boolean
  isNeedConclusion?: boolean
  sampleAmount?: number
  samplingDate?: string
  samplingPlace?: string
  samplingCompany?: string
  samplingPerson?: string
  samplingPersonNumber?: string
  objectType?: number
  externalInfo?: string
  noteworthy?: null
}

export interface CodeArr {
  objectCodeMainBody?: string
  objectCodeSuffix?: null
  testObjectCode?: string
}

export interface TestObjectOtherInfo {
  id?: string
  testObjectId?: string
  attributeId?: string
  name?: string
  displayName?: string
  value?: string
  infoType?: string
  dataType?: string
  systemFieldName?: string
  isDeleted?: string
  isShowTest?: boolean
  isDesignValue?: boolean
  customized?: boolean
  alias?: null
  isJoinSpecification?: boolean
}

export interface TestObjectParam {
  id?: string
  testObjectId?: string
  testParamId?: string
  isBuildSampleCode?: string
  tSTestParamId?: null
  testParamDisplayName?: string
  isTempParam?: null
  count?: number
  shareIdentity?: null
  price?: number
  isDeleted?: string
  isLocaleItem?: string
  checkPoint?: number
  generateAcceptSampleInfoByCount?: null
  generateProcessObject?: boolean
  remark?: string
  testObjectParamUseStandardVOs?: null
}

export interface TestObjectUseUdr {
  id?: string
  testObjectId?: string
  templateType?: string
  templateId?: string
  headHorizontalId?: string
  headVerticalId?: string
  tailHorizontalId?: string
  tailVerticalId?: string
  isDeleted?: string
  fileType?: string
  groupKey?: string
  name?: string
}
