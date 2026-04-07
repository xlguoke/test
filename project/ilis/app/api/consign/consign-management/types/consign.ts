import type { IProjectResDTO, IProjectWitness } from '../../project-management/types'
import type { CONSIGN_STATUS, EFeeDiscountMode, EGenerateCode } from '../enum'

/**
 * ## 委托基础类型
 * @description 包含IConsignInfoResDTO和IConsignDataDTO的公共属性
 */
export interface IBaseConsign {
  /** ## 委托ID */
  id?: string
  /** ## 委托编号 */
  consignCode?: string
  /** ## 委托单位名称 */
  consignUnitName?: string
  /** ## 委托单位地址 */
  consignUnitAddress?: string
  /** ## 工程项目名称 */
  projectTenderName?: string
  /** ## 送样人名称 */
  sampleSenderName?: string
  /** ## 送样人电话 */
  sampleSenderPhone?: string
  /** ## 委托日期 */
  consignDate?: string
  /** ## 送样日期 */
  sampleSendDate?: string
  /** ## 送样方式 */
  sampleSendType?: string
  /** ## 邮寄支付方式 */
  mailPayType?: string
  /** ## 邮寄单号 */
  mailOrderNumber?: string
  /** ## 委托大类 1-正常委托 2-综合委托 */
  consignBigType: '1' | '2'
  /** ## 检测类型 */
  consignType?: string
  /** ## 备注 */
  remark?: string
  /** ## 送样单位 */
  sampleSendUnitName?: string
  /** ## 检测类别ID */
  checkTypeId: string
  /** ## 资质类型ID： 仅当获取委托信息时，后端返回的类型为string，处理ts错误，前端使用始终为string[] */
  qualificationTypeId: string | string[] | undefined
  /** ## 缴费单位名称 */
  paymentUnitName?: string
  /** ## 缴费单位编码 */
  paymentUnitCode?: string
  /** ## 报告发放方式 */
  reportHandOverType?: number | string
  /** ## 报告打印份数 */
  reportPrintNum?: number
  /** ## 邮寄信息ID */
  postFormId?: string
  /** ## 要求报告日期 */
  requireReportDate?: string
  /** ## 样品处理方式 */
  sampleProcessMethod?: string
  /** ## 委托状态 */
  status?: CONSIGN_STATUS
  /** ## 编号类型ID */
  snTypeId: string
  /** ## 检测形式 */
  testType: string
  /** ## 样品来源 */
  sampleSource?: string
  /** ## 样品来源编码 */
  sampleSourceCode?: string
  /** ## 手动费用总额 */
  manualFeeTotal?: number | string
  /** ## 是否为预委托 1-是 0-否 */
  isPreconsign?: number
  /** ## 预委托ID */
  preConsignId?: string
  /** ## 预委托编号 */
  preConsignCode?: string
  /** ## 合同ID */
  contractId?: string
  /** ## 合同名称 */
  contractName?: string
  /** ## 检测合同ID */
  appointContractId?: string
  /** ## 检测合同名称 */
  appointContractName?: string
  /** ## 检测合同编号 */
  appointContractNo?: string
  /** ## 单位工程类型 */
  unitProjectType?: string
  /** ## 单位工程ID */
  unitProjectObjId?: string
  /** ## 单位工程名称 */
  unitProjectName?: string
  /** ## 折扣率 */
  discountRate?: number
  /** ## 编号预设模型 */
  snPresetMode?: string
  /** ## 收样日期 */
  sampleReceivedDate?: string
  /** ## 公路等级 */
  highwayLevel?: string
  /** ## 附件 - 二维码key */
  attachmentQrKey?: string
  /** ## 是否分包检测 */
  isSubcontract?: boolean
}

/**
 * ## 委托信息 - 构造参数
 * @description（委托详情数据，用于编辑回显），isSynthesisConsign，与consignWitnessEntity 包含其中
 */
export interface IConsignInfoResDTO extends IBaseConsign {
  /** ## 委托ID */
  id: string
  /** ## 行业ID */
  industryId: string
  /** ## 系统公司编码 */
  sysCompanyCode: string
  /** ## 委托单位 */
  consignUnit: IConsignUnit
  /** ## 工程项目 */
  project: IProjectResDTO
  /** ## 元数据信息 */
  metaData: IMetaDataInfo
  /** ## 送样人信息 */
  sampleSender: ISampleSender
  /** ## 委托见证信息 */
  consignWitnessInfo: IConsignWitness[]
  /** ## 委托自定义属性 */
  consignCustomAttributes: IConsignCustomAttribute[]
  /** ## 工程部位及用途 */
  projectPartAndUse: string
  /** ## 样品接收人名称 */
  sampleReceiverName: string
  /** ## 样品接收人证件号 */
  sampleReceiverLicenseNumber: string
  /** ## 开票单位名称 */
  invoicingUnitName: string
  /** ## 检测单位名称 */
  inspectionUnitName: string
  /** ## 施工单位名称 */
  constructionUnitName: string
  /** ## 预约日期 */
  appointmentDate: string
  /** ## 是否保密 */
  isConfidentiality: string
  /** ## 建设单位名称 */
  buildUnitName: string
  /** ## 监理单位名称 */
  witnessUnitName: string
  /** ## 建设单位见证人 */
  buildUnitWitness: string
  /** ## 要求报告天数 */
  requireReportDays: number
  /** ## 回退来源 */
  rollbackFrom: string
  /** ## 标准来源 */
  standardProvider: string
  /** ## 检测性质 */
  testNature: string
  /** ## 大类别ID */
  bigCategoryId: string
  /** ## 费用状态 */
  feeStatus: string
  /** ## 任务名称 */
  taskName: string
  /** ## 报告截止日期 */
  deadLineReport: string
  /** ## 记录截止日期 */
  deadLineRecord: string
  /** ## 分配截止日期 */
  deadLineAssigne: string
  /** ## 通知对象ID */
  noticeObjectId: string
  /** ## 通知修改意见 */
  notifyModifyOpinion: string
  /** ## 样品接收人名称 */
  sampleAcceptorName: string
  /** ## 样品接收人 */
  sampleAcceptor: ISampleAcceptor
  /** ## 是否为简单模式 */
  isSimpleModel: string
  /** ## 是否删除 1-是 0-否 */
  isDelete: number
  /** ## 取样ID */
  extractSampleId: string
  /** ## 取样人 */
  extractSamplePerson: string
  /** ## 取样人电话 */
  extractSamplePersonTel: string
  /** ## 取样单位 */
  extractSampleUnit: string
  /** ## 传真 */
  fax: string
  /** ## 委托对象名称 */
  consignObjectName: string
  /** ## 参数版本ID */
  paramVersionId: string
  /** ## 随机码 */
  randomCode: string
  /** ## 随机取样 */
  randomPickup: string
  /** ## 实际收样日期 */
  sampleActualReceivedDate: string
  /** ## 附件列表 */
  attachmentList: IAttachmentList[]
  /** ## 检测类型 */
  qualificationTypeId: string
}

/**
 * ## 委托数据
 */
export interface IConsignDataDTO extends IBaseConsign {
  /** ## 委托单位 */
  consignUnit: {
    /** ## 委托单位名称，仅用于前端表单显示 */
    name: string
    /** ## 委托单位ID */
    consignUnitId: string
    /** ## 委托单位名称 */
    consignUnitName: string
    /** ## 委托单位地址 */
    consignUnitAddress?: string
  }
  /** ## 委托单位地址：最终需要保存到consignUnit中，此处用于前端表单显示 */
  consignUnitAddress?: string
  /** ## 工程项目 */
  project?: {
    /** ## 工程项目名称，仅用于前端表单显示 */
    name: string
    /** ## 工程项目ID */
    projectId: string
    /** ## 工程项目招标名称 */
    projectTenderName: string
    /** ## 工程项目地址 */
    projectAddress?: string
  }
  /** ## 工程项目地址：最终需要保存到project中，此处用于前端表单显示 */
  projectAddress?: string
  /** ## 送样人 */
  sampleSender: {
    /** ## 委托人名称，仅用于前端表单显示 */
    name: string
    /** ## 送样人ID */
    sampleSenderId: string
    /** ## 送样人名称 */
    sampleSenderName: string
    /** ## 送样人电话 */
    sampleSenderPhone?: string
  }
  /** ## 单位工程/工程划分 */
  unitProject?: {
    /** ## 工程划分名称，仅用于前端表单显示 */
    name: string
    /** ## 单位工程类型 */
    unitProjectType: string
    /** ## 单位工程ID */
    unitProjectObjId: string
    /** ## 单位工程名称 */
    unitProjectName: string
  }
  /** ## 施工单位 */
  constructionUnitName?: string
  /** ## 监理单位 */
  witnessUnitName?: string
  /** ## 监理单位见证信息 */
  witnesses?: IConsignWitness[]
  /** ## 建设单位 */
  buildUnitName?: string
  /** ## 建设单位见证信息 */
  buildWitnesses?: IConsignWitness[]
  /** ## 取样样品id */
  extractSampleId?: string
  /** ## 抽样单位 */
  extractSampleUnit?: string
  /** ## 抽样人 */
  extractSamplePerson?: string
  /** ## 抽样人电话 */
  extractSamplePersonTel?: string
  /** ## 传真 */
  fax?: string
  /** ## 编号生成策略 1-生成委托编号 2-生成样品编号 3-生成来样编号  2000-手动生成样品编号 AutoSave-点击生成样品编号时自动保存委托 */
  generateCode?: EGenerateCode
  /** ## 邮寄信息 */
  postedit?: {
    /** ## 邮寄信息ID */
    postFormId: string
    /** ## 邮寄支付方式 */
    mailPayType: string
    /** ## 邮寄单号 */
    mailOrderNumber: string
  }
  /** ## 缴费单位 */
  paymentUnit?: {
    /** ## 缴费单位名称 */
    paymentUnitName: string
    /** ## 缴费单位编码 */
    paymentUnitCode: string
  }
  /** ## 收样日期 */
  sampleReceivedDate?: string
  /** ## 预约时间 */
  appointmentDate?: string
  /** ## 自定义属性 */
  customAttributes?: {
    /** ## 对象ID */
    objectId?: string
    /** ## 属性ID */
    attributeId: string
    /** ## 属性值 */
    attributeValue: string
  }[]
  /** ## 计费合同 */
  billingContract?: IContractInfo
  /** ## 关联检测合同 */
  appointContract?: IContractInfo
  /** ## 费用 */
  feeVo?: IFeeDTO
  /** ## 折扣率 */
  discountRate?: number
  /** ## 是否任务跳转 */
  isTaskRedirect?: string
  /** ## 样品列表：原来的元数据 */
  metaData: string
  /** ## 编号预设模型 */
  snPresetMode?: string
  /** ## 收样人 */
  sampleAcceptorName?: string
  /** ## 检测人员ID列表 */
  testPersonIds?: string[]
  /** ## 负责人ID列表 */
  principalIds?: string[]
  /** ## 报告编制人ID列表 */
  reportPersonIds?: string[]
  /** ## 复核人ID列表 */
  recheckPersonIds?: string[]
  /** ## 审核人ID列表 */
  auditPersonIds?: string[]
  /** ## 批准人ID列表 */
  approverIds?: string[]
  /** ## 部门ID */
  departmentId?: string
  /** ## 部门名称 */
  department?: string
  /** ## 检测任务ID */
  testTaskId?: string
  /** ## 任务ID */
  taskId?: string
}

/** ## 委托单位 */
export interface IConsignUnit {
  id: string
  name: string
  code: string
  constructionUnitName: string
  projectTenderName: string
  contactPerson: string
  contactPhone: string
  contactAddress: string
  zipCode: string
  cardNumber: string
  isQualitySupervise: string
  qualificationTypeId: string
  includedArea: string
  isDeleted: string
  remark: string
  consignProject: {
    [key: string]: any
  }
  witness: IProjectWitness[]
  consignUnitProjectUnit: IProjectWitness
  payUnitName: string
  payUnitCode?: string
}

/** ## 委托见证信息 */
export interface IConsignWitness {
  witness: string
  witnessLicenseNumber: string
  witnessPhone: string
  /** ## 见证类型 1-建设单位见证信息 2-监理单位见证信息 */
  type?: string
}

/** ## 元数据：样品列表 */
export interface IMetaDataInfo {
  id: string
  metaData: string
  dataVersion: number
}

/** ## 送样人 */
export interface ISampleSender {
  id: string
  account: string
  name: string
  contactPhone: string
  contactAddress: string
  zipCode: string
  signatureImageSrc: string
  status: string
  verifyStatus: string
}

/** ## 委托自定义属性 */
export interface IConsignCustomAttribute {
  id: string
  isBlind: string
  attributeName: string
  attributeValue: string
  defaultValue: string
  type: string
  candidates: string[]
}

/** ## 收样人 */
export interface ISampleAcceptor {
  id: string
  userName: string
  ssoName: string
  realName: string
  browser: string
  userKey: string
  status: number
  deleteFlag: number
  signatureFile: string
  mobilePhone: string
  officePhone: string
  email: string
  signPhoto: string
  loginTimes: number
  jobTitle: string
  certificateNo: string
  birthDay: string
  iconUrl: string
  signKey: string
  tripartiteUserId: string
  tripartiteType: string
  rfid: string
  idCard: string
  deedStatus: string
  type: number
}

/** ## 附件列表 */
export interface IAttachmentList {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: string
  updateName: string
  updateBy: string
  updateDate: string
  attachmentId: string
  attachmentName: string
  path: string
  type: number
  isDeleted: boolean
}

/** ## 合同信息 */
export interface IContractInfo {
  id: string
  name: string
  no: string
}

/** ## 费用信息 */
export interface IFeeDTO {
  /** ## 原价 */
  originalPrice?: number
  /** ## (所有)参数价格 */
  priceOfParameter?: number
  /** ## 合同折扣率 */
  contractDiscount?: number
  /** ## 合同折扣后价格 */
  priceAfterContractDiscount?: number
  /** ## 额外费用（附加费用） */
  additionalFee?: number
  /** ## (手动)折扣前价格(应收金额) */
  priceBeforeDiscount?: number
  /** ## 输入的折扣率 */
  discount?: number
  /** ## 额外费用参与折扣(-1-不判定，0-不参与，1-参与) */
  additionalFeeInvolvedInDiscount?: EFeeDiscountMode
  /** ## (手动)折后费用 */
  priceAfterDiscount?: number
  /** ## 执行折扣率 */
  performDiscount?: number
  /** ## 额定费用（实收费用） */
  ratedFee?: number
  /** ## 样品价格 */
  samplePrice?: { [key: string]: number }
  /** ## 费用明细 */
  feeDetail?: { [key: string]: ICustomFeeDetail[] }
  /** ## 包含所有合同参数（null -不判定） */
  containsAllContractParam?: boolean | null
  /** ## 合同标识 */
  contractId?: string
  /** ## 合同名称 */
  contractName?: string
  /** ## 合同编号 */
  contractNo?: string
  /** ## 收费标准 */
  chargeStandard?: string
  /** ## 用户自定义的附加费用计算明细 */
  customFeeDetail?: ICustomFeeDetail[]
  /** ## 没有进行计算的 */
  nonCompute?: boolean
  /** ## 调整折扣率 */
  adjustDiscount?: number
  /** ## 调整前价格 */
  priceBeforeAdjust?: number
}

/** ## 自定义费用明细 */
export interface ICustomFeeDetail {
  name: string
  sampleName: string
  /** ## 单价 */
  price: number
  /** ## 总费用 */
  value: number
  /** ## 计算流程 */
  computeProcess: string
  /** ## 共享单价标识 */
  ShareIdentity: string
  /** ## 样品标识 */
  mark: string
  /** ## 样品组数 */
  amount: number
  /** ## 检测点数 */
  count: number
  discount: number
  /** ## 费用类型（1.试验参数 2.附加费用 3.其他） */
  feeType: number
  paramId: string
  /** ## 价格类型(0-样品价格，1-参数价格，2-子价格，3-共享价格，4-脚本价格) */
  priceType: number
  /** ## 共享价格 */
  sharePrice: number
  /** ## 标准价格 */
  standardPrice: number
  /** ## 合同价格 */
  contractPrice: number
  /** ## 价格单位 */
  priceUnit: string
  /** ## 收费标准 */
  chargeStandard: string
}
