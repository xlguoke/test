import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** # 测试任务接口 ⚙️ */
export interface ITestTask {
  /** 分配日期 */
  allocDate: string
  /** 分配人 */
  assigner: string
  /** 测试任务编号 */
  testTaskCode: string
  /** 测试记录编号 */
  testRecordCode: string
  /** 测试人员名称 */
  testUsersName: string
  /** 测试参数名称 */
  testParamNames: string
  /** 测试日期 */
  testDate: string
}

/** # 测试任务摘要接口 ⚙️ */
export interface ITestTaskSummary {
  /** 分配类型(0:按样品分配;1:按参数分配) */
  assignType: string
  /** 是否需要合并报告 */
  needMergeReport: boolean
  /** 审核人员名称 */
  reviewUsersName: string
  /** 审核日期 */
  reviewDate: string
  /** 测试任务列表 */
  testTasks: ITestTask[]
}

/** # 测试对象接口 ⚙️ */
export interface ITestObject {
  /** 测试样品显示名称 */
  testSampleDisplayName: string
  /** 标准 */
  standard: string
  /** 测试对象代码 */
  testObjectCodes: string
  /** 样品数量 */
  sampleNum: string
  /** 测试部位 */
  testPart: string
  /** 工程部位及用途 */
  projectPartAndUse: string
  /** 测试参数名称 */
  testParamNames: string
}

/** # 委托信息接口 ⚙️ */
export interface IConsign {
  /** 委托单位名称 */
  consignUnitName: string
  /** 单位工程名称 */
  unitProjectName: string
  /** 委托日期 */
  consignDate: string
  /** 样品送达日期 */
  sampleSendDate: string
  /** 资质类型名称 */
  qualificationTypeNames: string
  /** 检测类型名称 */
  checkTypeName: string
  /** 样品来源 */
  sampleSource: string
  /** 样品接收人名称 */
  sampleAcceptorName: string
  /** 委托方是否签字 */
  consignSigned: boolean
  /** 建设方是否签字 */
  buildSigned: boolean
  /** 监理方是否签字 */
  supervisingSigned: boolean
  /** 工程项目ID */
  consignProjectId: string
}

export enum ReportType {
  /** 正式报告 */
  Formal = 'formal',
  /** 临时报告 */
  Temporary = 'temporary',
  /** 综合报告 */
  Synthesis = 'synthesis',
  /** 综合报告的临时报告 */
  SynthesisTemp = 'synthesis_Temp',
}

export const ReportTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '正式报告', key: ReportType.Formal },
  { label: '临时报告', key: ReportType.Temporary },
  { label: '综合报告', key: ReportType.Synthesis },
  { label: '综合报告的临时报告', key: ReportType.SynthesisTemp },
])

/** # 报告信息接口 ⚙️ */
export interface IReportInfo {
  /** 报告ID */
  reportId: string
  /** 报告编号 */
  reportNumber: string
  /** 报告审核日期 */
  auditDate: string
  /** 报告批准日期 */
  signDate: string
  /** 报告类型（报告类型 formal:正式报告, temporary:临时报告, synthesis:综合报告, synthesis_Temp:综合报告的临时报告） */
  reportType: ReportType
  /** 报告参数 */
  testParamsName: string
  /** 报告资质 */
  qualificationTypesName: string
  /** 报告印章 */
  sealsName: string
  /** 审核人员 */
  auditUsersName: string
  /** 批准人员 */
  approveUsersName: string
  /** 委托信息 */
  consign: IConsign
  /** 测试对象 */
  testObject: ITestObject
  /** 测试任务摘要 */
  testTaskSummary: ITestTaskSummary
}

/** # 是否线下报告 */
export async function isOfflineReportFun(testTaskId: string) {
  const { data } = await IlisApiHelper.get<any>('testTaskController/getTestObject.do', { testTaskId })
  if (data?.[0]?.testObjectParams?.some((i: any) => i.isOfflineReport === '1')) {
    return true
  }
  return false
}

/** # 查询报告附件信息 */
export async function getReportFile(reportId: string) {
  return await IlisApiHelper.get<any>('reportAuditController.do?getReportDetailGeneral', {
    reportId,
    requestFrom: 'approve_detail',
  })
}

/** # 获取“线下出具报告文件” */
export async function getOfflineReportFile() {
  return await IlisApiHelper.get<any>('rest/testTaskReportController.do?getDefaultOfflineReportPdfAttachment=')
}

/** # 报告关联信息详情 */
export async function getApproveReportRelatedInfoDetail(reportId: string) {
  return await IlisApiHelper.get<IReportInfo>(`/reportController/approve/related/info/detail/${reportId}`)
}

/** # 获取报告转换状态 */
export async function getReportConvertStatus(reportId: string) {
  return await IlisApiHelper.get<any>(`rest/reportAuditController/reportFileConvertInfo`, {
    reportId,
    requestFrom: 'audit_detail',
  })
}

/** # 获取综合检测方案 */
export async function getComprehensiveTestScheme(reportId: string) {
  return await IlisApiHelper.get<any>(`reportAuditController/${reportId}`)
}
