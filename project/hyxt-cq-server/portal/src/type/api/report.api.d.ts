// 样品信息
export interface samplesType {
  id?: string
  name: string //样品名称
  sn: string //样品编号
  specification: string //规格型号
  testPart: string //检测部位
  projectPartOrUse: string //工程部位/用途
  amount: number //样品数量
  behalfAmount: number //代表数量
  manufacturer: string //生产厂家
  batchNumber: string //产品批号
  productionDate: dayjs | null //出厂日期
  productionSn: string //出厂编号
  enterSiteDate: dayjs | null //进场日期
  maintainCondition: string //养护条件
  testItems: string //检测参数
  witnessUnit: string //见证单位
  witness: string //见证人
  witnessCertNo: string //见证人证书号
  samplingCompany: string //取样单位
  samplingPlace: string //取样地点
  samplingPerson: string //取样人
  samplingDate: dayjs | null //取样日期
  samplingPersonNumber: string //取样人证件号
}

interface ObjectStringType{
  [key: string]: any
}

export interface fileType {
  name: string //附件名称
  url: string //附件访问地址
  remark?: string //附件备注
}

// 报告信息
export interface dataItemType {
  id?: string // 报告ID
  isSubcontract: boolean // 是否外围报告,不能为null
  laboratoryId: string //试验室ID
  laboratory: string //试验室名称
  testLaboratory: string //检测机构
  consignSn: string //委托编号
  // sampleSn: string //样品编号
  // recordSn: string //记录编号
  sn: string //报告编号
  snVersionSuffix: string // 报告编号后缀-更正标识
  consignUnit: string //委托单位
  checkType: string //委托类型
  sampleSender: string //委托人
  sampleSenderTel: string //委托人电话
  project: string //项目名称
  projectSection: string //标段名称
  consignDate: number | null //委托日期
  qualification: string //资质类型
  testBasis: string //检测依据
  evaluationStandard: string //判断依据
  tester: string //检测人
  recorder: string //记录人
  assistant: string //协助人
  editor: string //编写人
  reviewer: string //复核人
  auditor: string //审核人
  approver: string //批准人
  equipmentSn: string //设备编号
  equipmentName: string //设备名称
  auditTime: number | null //审核时间
  testTimeBegin: number | null //检测开时间
  testTimeEnd: number | null //检测结束时间
  isQualified: boolean | null | number //是否合格
  signDate: string //签发日期
  isTemporary: boolean //是否临时报告
  securityCode: string //防伪码值, 只有行管强制变更时, 才能修改
  queryCode: string //查询码/验证码, 只有行管强制变更时, 才能修改
  verdictRemark: string //备注
  samples: samplesType[] //样品
  attachments: fileType[] // 附件
  version: number // 版本
  // 更正信息
  versionInfo?: {
    reason: string // 更正理由
    amendTime: number | string
  } 
}

// 变更内容结果展示
export interface CheckFieldsType {
  field: string
  fieldName: string
  beforeChange: any
  afterChange: any
}

// 对比样品信息
export interface CheckSampleType {
  name: string
  type: string
  details: Array<CheckFieldsType> | samplesType
}
// 对比报告字段信息
export interface CheckResultType {
  isChange: boolean
  baseInfo: Array<CheckFieldsType>
  samples: Array<CheckSampleType>
}
