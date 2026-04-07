import { z } from 'zod'
import { report } from 'custodian'
import type { ReportDetail } from '../../../packages/custodian/src/types/report'
import { TestTaskService } from './TestTaskService'
import { request } from '@/axios'

export interface ReportInfoDTO {
  id: string
  createName: string
  createBy: string
  createDate: number
  updateName: string
  updateBy: string
  updateDate: number
  bpmStatus: string
  submitDate: number
  reportNumber: string
  historyId: string | null
  handoverWay: string | null
  printStatus: string
  issueStatus: string
  archiveStatus: string | null
  chargeStatus: string | null
  reportType: string
  reportStatus: string
  version: string | null
  sysCompanyCode: string
  isDelete: string
  periodId: string | null
  reportPersonVos: Array<{
    reportId: string | null
    userId: string
    userRealName: string
    type: string
  }>
  consignUnitId: string
  consignProjectId: string
  qualificationTypeId: string | null
  contractId: string | null
  copies: number
  testTimeBegin: number | null
  testTimeEnd: number | null
  isQualified: string
  verdict: string
  verdictRemark: string
  backFrom: string
  beenModified: string
  isScrap: string
  reviewDate: number
  signDate: number | null
  roundType: string
  isMarkPrint: string | null
  isStamp: string | null
  coreId: string | null
  coreSn: string | null
  otherObjectId: string | null
  otherSourceFrom: string | null
  mergeAuditSignature: boolean
  signatureStatus: string | null
  convertStatus: string
  reportTestParamVos: Array<{
    reportId: string
    testObjectParamId: string
    paramDisplayName: string
  }>
  isParamSplit: boolean
  personVos: any | null
  reportSeals: any[]
  autoIsQualified: number
  extend: any | null
  consignUnitName: string | null
  consignProjectName: string | null
  snCategoryId: string
  consignId: string | null
  testObjectId: string
  testTaskId: string | null
  reportFileAttachmentId: string | null
  regulatoryId: string
  signTagSelect: string | null
  paramSplit: boolean
}

/** 报告类型 */
export enum ReportType {
  正式报告 = 'formal',
  临时报告 = 'temporary',
  按参数拆分报告 = 'formal_AB',
}

/** 报告人员 */
export enum ReportPersonType {
  检测人员 = '0',
  复核人员 = '1',
  审核人员 = '3',
  批准人员 = '4',
  记录人员 = '5',
  协助人员 = '6',
  报告编写人员 = '2',
  项目负责人员 = '7',
}

export const isQualifiedEnum: Record<string, string> = {
  1: '合格',
  0: '不合格',
  2: '不做判定',
  3: '未填写',
}

/**
 * 试验报告
 */
export class TestReportService {
  // 缓存
  private cache: {
    /** 提交报告时详情数据 */
    reportDetail?: ReportDetail
    /** 报告信息 */
    reportInfo?: ReportInfoDTO
    /** 报告签发日期必填 */
    isRequireSignDate?: boolean
  } = {}

  testTaskService: TestTaskService

  /** 新报告 */
  get isNewReport() {
    return !this.reportId
  }

  constructor(public testTaskId: string, public reportId?: string) {
    this.testTaskService = new TestTaskService(this.testTaskId)
  }

  clearCache(key?: 'reportDetail' | 'reportInfo') {
    if (key)
      this.cache[key] = undefined
    else
      this.cache = {}
  }

  async getReportDetail(reportType?: ReportType) {
    if (this.cache.reportDetail !== undefined)
      return this.cache.reportDetail

    const res = await request({
      url: '/ilis2/testTaskReportController.do?getAllInfoForReportPage',
      method: 'post',
      data: {
        testTaskId: this.testTaskId,
        reportId: this.reportId,
        reportType: this.reportId ? '' : reportType,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      schema: z.object({
        success: z.boolean(),
        attributes: report.Validator.reportDetail,
      }),
    })

    const data = res.attributes
    this.cache.reportDetail = data

    return data
  }

  /** 检查当前任务（或样品下）是否存在正式报告，若存在则不能再提交正式报告 */
  async getFormalReport() {
    const res = await request({
      url: '/ilis2/testTaskReportController.do?getFormalReportByTestTask',
      method: 'post',
      data: {
        testTaskId: this.testTaskId,
      },
      schema: z.object({
        success: z.boolean(),
        obj: z.any().nullable(),
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return res.obj
  }

  /** 检查是否开启了对比参数 */
  async checkWordContrastBusinessParam(): Promise<boolean> {
    const res = await request({
      method: 'GET',
      url: '/ilis2/rest/report/word/contrast/check/business/param',
      params: {
        taskId: this.testTaskId,
        reportId: this.reportId || undefined,
      },
    }) as any

    if (!res)
      return false

    return res.length > 0
  }

  /** 检查当前任务对应的报告文件是否含有word文件 */
  async checkScheduleAttachmentType(attachmentIds: string[]): Promise<boolean> {
    const res = await request({
      method: 'GET',
      url: '/ilis2/rest/equipment/schedule/attachment-type',
      params: {
        taskId: this.testTaskId,
        reportId: this.reportId || undefined,
        attachmentIds: attachmentIds.length ? attachmentIds.join(',') : undefined,
      },
    })

    return !!res
  }

  async getReportInfo() {
    if (this.cache.reportInfo !== undefined)
      return this.cache.reportInfo

    const res = await request({
      method: 'GET',
      url: '/ilis2/rest/reportController/getReportInfo',
      params: {
        reportId: this.reportId,
      },
    }) as ReportInfoDTO

    return res
  }

  /** 获取临时报告 */
  async getTempReport() {
    const res = await request({
      method: 'GET',
      url: '/ilis2/testTaskReportController.do?getTempReportByTestTask',
      params: {
        testTaskId: this.testTaskId,
      },
    }) as any

    return res.obj || []
  }

  /** 报告签发日期是否必填 */
  async checkIsRequireSignDate() {
    if (this.cache.isRequireSignDate !== undefined)
      return this.cache.isRequireSignDate

    const res = await request({
      method: 'GET',
      url: '/ilis2/rest/signer/requestSignDate',
    }) as boolean

    this.cache.isRequireSignDate = res

    return res
  }

  /** 获取报告转换进度 */
  async getConvertProgress() {
    const res = await request({
      method: 'GET',
      url: `/ilis2/rest/reportFileController/convertProgress/${this.reportId}`,
    }) as number

    return res
  }
}
