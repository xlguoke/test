export class TestParamQuery {
  'bigCategory.id'?: string
  'bigCategory.paramVersionId'?: string
  showDeleted?: '0' | '1' = '0'
  isTree? = true
  testItemName?: string
  name?: string
  displayName?: string
  paramCategoryId?: string
}

export interface ParamTableInfoItem {
  id: '402882c1936bc92501936c3d5a7f0022'
  sysCompanyCode: 'A03'
  createName: '管理员'
  createBy: 'admin'
  createDate: '2024-11-27 14:09:40'
  updateName: null
  updateBy: null
  updateDate: null
  unitCode: 'gfzx'
  recordUniqCode: 'JGLQ04025b'
  recordTableName: '水泥一氧化锰试验检测记录表'
  reportUniqCode: 'BGLQ04001F'
  reportTableName: '水泥试验检测报告'
  version: 1
}

export interface TestParamEntity {
  qdmTest: false
  recordUniqCode: 'JGLQ04025b'
  generateAcceptSampleInfoByCount: false
  pid: null
  sysCompanyCode: 'A03'
  bigCategory: {
    id: 'babddf4885e17e0c3c1b44f0518586a4'
    sysCompanyCode: 'A03'
    createName: '管理员从单位[海特唐金玉]引用'
    createBy: '8a8ab0b246dc81120146dc8181950052'
    createDate: '2024-11-11 10:07:37'
    updateName: null
    updateBy: null
    updateDate: null
    unitCode: null
    otherPlatformId: null
    name: '粗集料'
    code: null
    testType: null
    qualificationType: null
    level: '0001,0001,0001,0001,0001'
    orderNum: 1
    isDeleted: '0'
    remark: '测试备注2'
    paramVersionId: 'e0afa34e5f754df185081932462af623'
    children: []
  }
  generateProcessObject: true
  paramCategoryId: 'CLEAR'
  paramType: '10'
  acceptRequireContent: null
  qualifications: []
  children: []
  unitCode: 'gfzx'
  paramCategoryName: null
  id: string
  isHaveUdr: true
  additionalFees: []
  relationParams: null
  testItemId: '5faa4917-40fa-497c-a277-4ef5b3a2f92b'
  preConsignShow: false
  reportUniqCode: 'BGLQ04001F'
  updateName: '管理员'
  version: 1
  testItemName: '水泥试验'
  acceptRequireImageSrc: null
  unit: ''
  paramTableInfoList: ParamTableInfoItem[]
  reportTableName: '水泥试验检测报告'
  isLocaleItem: 'false'
  name: '一氧化锰含量(原子吸收分光光度法)'
  createName: '管理员'
  otherPlatformId: null
  chemically: null
  isBuildSampleCode: 'true'
  updateDate: 1733996139000
  code: null
  displayName: '一氧化锰含量(原子吸收分光光度法)'
  orderNum: 100
  remark: ''
  serialVersionUID: 3245261362582067000
  isDeleted: '0'
  updateBy: 'admin'
  testParam: {
    id: '402882c1936bc92501936c3d5a7e0021'
    sysCompanyCode: 'A03'
    createName: '管理员'
    createBy: 'admin'
    createDate: '2024-11-27 14:09:40'
    updateName: '管理员'
    updateBy: 'admin'
    updateDate: '2024-12-12 17:35:39'
    unitCode: 'gfzx'
    otherPlatformId: null
    name: '一氧化锰含量(原子吸收分光光度法)'
    displayName: '一氧化锰含量(原子吸收分光光度法)'
    systemId: '64e4d9cd-f232-44f6-93e2-255b3cd1bbec'
    code: null
    testItemId: '5faa4917-40fa-497c-a277-4ef5b3a2f92b'
    testItemName: '水泥试验'
    autoAddBlendSample: true
    isTempParam: '0'
    isLocaleItem: 'false'
    isBuildSampleCode: 'true'
    generateAcceptSampleInfoByCount: false
    generateProcessObject: true
    isDeleted: '0'
    remark: ''
    acceptRequireContent: null
    acceptRequireImageSrc: null
    orderNum: 100
    paramWorkDay: null
    paramNote: null
    pid: null
    paramType: '10'
    isHaveUdr: true
    chemically: null
    manHour: null
    paramCategoryId: 'CLEAR'
    paramCategoryName: null
    qdmTest: false
    unit: ''
    preConsignShow: false
  }
  isTempParam: '0'
  autoAddBlendSample: true
  createDate: 1732687780000
  systemId: '64e4d9cd-f232-44f6-93e2-255b3cd1bbec'
  manHour: null
  paramNote: null
  recordTableName: '水泥一氧化锰试验检测记录表'
  createBy: 'admin'
  paramWorkDay: number
  testQuantity: number
}
