/** 发放列表报告数据 */
export interface PageReportData {
  consignId: string
  consignSn: string
  consignDesc: string
  issueNum?: number
  isQualified: string
  autoIsQualified: number
  consignUnitName: string
  signDate: Date
  operatorName?: string
  issueCount?: number
  mailNumber?: number
  testObjectNames: string
  reportType: string
  issueSignPicUrl: string
  appointIssueWay: number
  reviseRid?: string
  projectCode: string
  provideToCustomerSampleCode: string
  invoiceNumber?: number
  contractName: string
  issueDate?: string
  cooperativeUnit: string
  testParamsName: string
  requireReportDate?: string
  issueId?: string
  mailCompany?: string
  reportId: string
  reportSn: string
  receiver?: string
  acceptor: string
  markObjectColorTextIds?: string
  projectNature: string
  reviseSnSuffix?: string
  reportDesc?: string
  postFormId: string
  issueWay?: string
  sampleSenderName: string
  sourceRid: string
  sourceRsn: string
  testTaskIds: string
  consignDate: Date
  reviseVersion: number
  feeStatus: string
  snCategory: string
  revised: boolean
  projectName: string
  testObjectCode: string
}

/** 报告发放方式 */
export enum IssueWay {
  /** 自取 */
  SELF_PICK = 1,
  /** 邮寄 */
  POST = 3,
  /** 传真 */
  // FAX = 'FAX',
  /** 电子报告 */
  ELECTRONIC = 10,
}

/** 报告发放方式字典 */
export const IssueWayDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: IssueWay.SELF_PICK,
    label: '自取',
    description: 'receiverone',
  },
  {
    key: IssueWay.POST,
    label: '邮寄',
  },
  // {
  //   key: IssueWay.FAX,
  //   label: '传真',
  // },
  {
    key: IssueWay.ELECTRONIC,
    label: '电子报告',
  },
])

export interface ReportData {
  reportId: string
  /** 报告编号 */
  reportNumber: string
  /** 项目 */
  projectName: string
  /** 样品名称 */
  testObjectName: string
  /** 报告份数对应委托的reportPrintNum */
  reportNum?: string
  /** 发放方式 */
  reportHandOverType: IssueWay
  /** 委托编号 */
  consignCode: string
  /** 委托单位 */
  consignUnitName: string
  /** 报告领取人 */
  preReceiver?: string
  /** 报告领取人签名 */
  receiverSignature: string
  /** 报告类型 */
  reportType: string
  /** 委托人 */
  consignPerson: string
}

export type TabType = '0' | '1' | '2'

/** 添加、编辑初始参数 */
export interface IAddEditProps {
  /** 选择的报告 */
  reports: PageReportData[]
  /** 发放id：已发放报告 */
  issueId?: string
  /** 报告发放方式 */
  issueWayLen?: number
  /** 是否为字纸报告 */
  isPaper?: boolean
  /** tab标签下标 */
  tabType: TabType
  /** 只读模式 */
  isReadOnly?: boolean
  /** 保存回调 */
  callback?: (res?: any) => void
}
