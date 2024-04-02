import { z } from 'zod'
import type { AppTask } from 'custodian'

// 任务记录 - 查询参数
const taskListQuery = z.object({
  q: z.string().optional(),
  projectName: z.string().optional(),
  allocDateStart: z.string().optional(),
  allocDateEnd: z.string().optional(),
  paramName: z.string().optional(),
  status: z.any(),
})

// 任务列表 - 接口参数
export const onlineTaskList = z
  .object({
    allocDate: z.string().nullable(),
    projectName: z.string().nullable(),
    sampleDisplayName: z.string(),
    paramsName: z.string(),
    testRecordCode: z.string(),
    testObjectCode: z.string().nullable(),
    testTaskCode: z.string(),
    testTaskId: z.string(),
    status: z.string().optional(),
  })
  .transform(item => ({
    id: item.testTaskId,
    testTaskId: item.testTaskId,
    taskCreateTime: item.allocDate,
    testTaskCode: item.testTaskCode,
    testObjectCode: item.testObjectCode,
    sampleName: item.sampleDisplayName,
    params: item.paramsName,
    projectName: item.projectName,
    status: item.status,
  }))

// 任务列表 - 列表展示
const taskListDTO = z
  .object({
    recordCode: z.string().optional(),
    sampleId: z.string().optional(),
    projectId: z.string().optional(),
    unitProjectId: z.string().optional(),
    unitProjectName: z.string().optional(),
    onsite: z.number().optional(),
  })
  .and(onlineTaskList)

// 任务记录 - 离线数据任务详情 - 基础信息
const offlineTaskBaseInfoDTO = z.object({
  id: z.string().optional(), // 任务ID
  sampleId: z.string(), // 样品id
  sampleName: z.string(), // 样品名称
  projectName: z.string(), // 工程项目名称
  projectId: z.string(), // 工程项目id
  unitProjectName: z.string(), // 单位工程或者合同段
  unitProjectId: z.string(), // 单位工程或者合同段id
  template: z.string(), // 模板名称
  templateId: z.string(), // 模板id
  testItemId: z.string(), // 检测项目id
})

// 上传数据集
const recordValues = z.object({
  name: z.string(),
  value: z.string(),
  testItemId: z.string(),
})

// 上传参数
const recordParams = z.object({
  testParamId: z.string(),
  testParamName: z.string(),
  standards: z.array(
    z.object({
      baseStandardId: z.string(),
      standardId: z.string(),
      standardName: z.string().optional(),
      standardType: z.union([z.literal('1'), z.literal('2'), z.literal('3')]),
      publishCode: z.string().optional(),
    }),
  ),
})

// 上传模板
const templates = z.object({
  udrId: z.string(),
  appId: z.string(),
  testItemId: z.string(),
})

// 离线数据上传
const uploadOfflineDataDTO = z.object({
  autoImport: z.boolean().nullable(),
  handbookId: z.string(),
  recordSn: z.string().optional(), // 离线记录编号
  handbookSn: z.string().optional(), // 离线任务编号
  testTaskId: z.string(),
  testTaskCode: z.string().optional(),
  testSampleId: z.string(),
  testSampleDisplayName: z.string(),
  paramJson: z.string().optional(),
  projectId: z.string(),
  projectName: z.string(),
  unitProjectId: z.string().optional(),
  unitProjectName: z.string().optional(),
  unitProjectType: z.string().optional(),
  udrId: z.string().optional(),
  appId: z.string().optional(),
  recordValues: z.array(recordValues),
  templates: z.array(templates),
  recordParams: z.array(recordParams).optional(),
})

type TaskStatus = Partial<Pick<AppTask, 'status'>>

// 查询条件
export type TaskListQuery = z.infer<typeof taskListQuery>

// 任务列表
export type TaskListDTO = z.infer<typeof taskListDTO>

// 详情基础信息
export type TaskBaseInfoDTO = TaskStatus & z.infer<typeof offlineTaskBaseInfoDTO>

// 上传离线数据
export type UploadOfflineDataDTO = z.infer<typeof uploadOfflineDataDTO>

// 上传列表
export type UploadListDTO = Omit<TaskListDTO, 'status' | 'params'> & {
  status?: string
  statusText?: string
}
