import { z } from 'zod'
import { report } from 'custodian'
import { SystemParamEnableType, SystemParamService, SystemParamType } from './SystemParamService'
import { request } from '@/axios'
import type { TestObjectDTO } from '@/type/sample'

const systemParamService = new SystemParamService()

export interface TestTaskDTO {
  id: string
  testTaskCode: string
  allocDate: string
  finishDate: string
  reportDate: string
  pid: string
  status: string
  requireCompletedDate: string
  workflowStatus: string
  beenNoticeModify: string
  isQualified: string
  testConclusion: string
  testConclusionRemark: string
  consignInfo: any
  testObjects: TestObjectDTO[]
  testTaskPersons: any[]
  testTaskParams: any[]
  bigType: string
  isDeleted: string
  assignType: string
  needMergeReport: boolean
  testDate: number
  testEndDate: number
  testConditions: string
  internalReportDate: string
  reportReviseStatus: number
}

export interface TestTaskAttachmentDTO {
  test_task_id: string
  need_resave: string
  remark: string
  type: string
  update_name: string
  create_by: string
  generate_status: string
  attachment_version: number
  use_type: string
  comm_attachment_id: string
  sys_company_code: string
  is_deleted: string
  unit_code: string
  id: string
  create_date: number
  update_by: string
  source_type: string
  delete_type: string
  uri: string
  update_date: string
  is_show: string
  test_object_use_udr_id: string
  test_object_id: string
  name: string
  template_id: string
  sys_file_source_from: string
  test_task_attachment_folder_id: string
  order_num: number
  create_name: string
  group_key: string
}

/**
 * 试验任务
 */
export class TestTaskService {
  /** 缓存 */
  private cache: {
    // 任务详情
    testDetail?: TestTaskDTO
    // 是否现场试验
    isFieldExperiment?: boolean
    // 是否线下出具报告
    isOfflineReport?: boolean
    // 是否有设备使用记录权限
    enableEquipmentRecordPower?: boolean
    // 文件
    attachments?: TestTaskAttachmentDTO[]
  } = {}

  constructor(private testTaskId: string) {}

  /** 清除缓存 */
  clearCache() {
    this.cache = {}
  }

  /** 获取任务详情 */
  async getTaskDetail() {
    if (this.cache.testDetail !== undefined)
      return this.cache.testDetail

    const data = await request({
      url: `/ilis2/testTaskController.do?getTestTaskDetail`,
      params: {
        id: this.testTaskId,
      },
    })

    this.cache.testDetail = data as TestTaskDTO

    return this.cache.testDetail
  }

  /** 生成设备运行记录 */
  async equipmentOperationRecord() {
    const res = await request({
      url: `/ilis2/rest/equipment/schedule/${this.testTaskId}`,
      method: 'POST',
    })

    return res
  }

  /** 检查是否为现场试验 */
  async checkIsFieldExperiment() {
    if (this.cache.isFieldExperiment !== undefined)
      return this.cache.isFieldExperiment

    await request({
      url: '/ilis2/rest/equipment/schedule/check',
      params: {
        taskId: this.testTaskId,
      },
    }).then(() => {
      this.cache.isFieldExperiment = true
    }).catch(() => {
      this.cache.isFieldExperiment = false
    })

    return this.cache.isFieldExperiment
  }

  /** 检查当前任务是否有设备记录权限 */
  async checkEquipmentRecordPower(): Promise<boolean> {
    if (this.cache.enableEquipmentRecordPower !== undefined)
      return this.cache.enableEquipmentRecordPower

    const taskDetail = await this.getTaskDetail()

    if (['20', '22'].includes(taskDetail.status)) {
      // 是否现场实验
      const isFieldExperiment = await this.checkIsFieldExperiment()

      if (isFieldExperiment) {
        const param = await systemParamService.getBusinessParam(SystemParamType['现场检测报告附件上传，生成仪器设备使用记录附表'])
        if (param === SystemParamEnableType.开启) {
          this.cache.enableEquipmentRecordPower = true
          return true
        }
      }
    }

    this.cache.enableEquipmentRecordPower = false
    return false
  }

  /** 获取检测样品信息 */
  async getTestObjects() {
    if (this.cache.testDetail !== undefined)
      return this.cache.testDetail.testObjects

    const testDetail = await this.getTaskDetail()
    return testDetail.testObjects || []
  }

  /** 检查是否是线下出具报告 */
  async checkIsOfflineReport() {
    if (this.cache.isOfflineReport !== undefined)
      return this.cache.isOfflineReport

    const testObjects = await this.getTestObjects()
    const testObject = testObjects[0]

    this.cache.isOfflineReport = false

    if (testObject.testObjectParams && testObject.testObjectParams.length > 0) {
      const params = testObject.testObjectParams
      for (let i = 0; i < params.length; i++) {
        if (params[i].isOfflineReport === '1') {
          this.cache.isOfflineReport = true
          break
        }
      }
    }

    return this.cache.isOfflineReport
  }

  /** 获取报告文件 */
  async getAttachments() {
    if (this.cache.attachments !== undefined)
      return this.cache.attachments

    const res = await request({
      url: '/ilis2/testTaskReportController.do?getAttachmentGridByTaskId&reChoose=reChoose',
      params: {
        testTaskId: this.testTaskId,
      },
    }) as {
      rows: TestTaskAttachmentDTO[]
      total: number
    }

    this.cache.attachments = res.rows

    return this.cache.attachments
  }

  /** 获取报告 */
  async getTestTaskReportInfo() {
    const res = await request({
      url: '/ilis2/testTaskController.do?getTestTaskReportInfo',
      method: 'get',
      params: {
        testTaskId: this.testTaskId,
      },
      schema: z.object({
        success: z.boolean(),
        obj: z.array(report.Validator.testTaskReport),
      }),
    })

    return res
  }
}
