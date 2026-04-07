import { z } from 'zod'

/** 设备使用记录 */
const equipmentUseLog = z.object({
  id: z.string(),
  testTaskId: z.string(),
  testTaskParamId: z.string(),
  testParamDisplayName: z.string(),
  equipmentId: z.string(),
  testObjectParamId: z.string(),
  equipmentCode: z.string(),
  equipmentName: z.string(),
  startUseState: z.string().nullable(),
  endUseState: z.string().nullable(),
  startUseTime: z.number().nullable(),
  endUseTime: z.number().nullable(),
  remark: z.string().nullable(),
  /** 物联网设备id */
  iotEquipmentId: z.string().nullable(),
  mac: z.string().nullable(),
  /** 该字段存在时，表示物联设备主设备自动采集的记录 */
  dataGatherId: z.string().nullable(),
  sourceFrom: z.string().nullable().optional(),
})

/** 设备维度 - 设备使用记录 */
export const equipmentUseRecordEq = z.object({
  equipmentId: z.string(),
  equipmentCode: z.string(),
  equipmentName: z.string(),
  useLogs: z.array(equipmentUseLog),
}).transform(item => ({
  name: item.equipmentName,
  id: item.equipmentId,
  code: item.equipmentCode,
  useLogs: item.useLogs,
}))

/** 参数维度 - 设备使用记录 */
export const equipmentUseRecordParam = z.object({
  testParamDisplayName: z.string(),
  testTaskParamId: z.string(),
  useLogs: z.array(equipmentUseLog),
}).transform(item => ({
  name: item.testParamDisplayName,
  id: item.testTaskParamId,
  code: '',
  useLogs: item.useLogs,
}))

/** 设备使用记录列表 - 将设备/参数维度数据处理成统一结构 */
export const equipmentUseRecordList = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().nullable(),
  useLogs: z.array(equipmentUseLog),
})

/** 任务参数绑定的物联设备 */
export const taskParamEquipment = z.object({
  id: z.string(),
  name: z.string(),
  equipmentSn: z.string().nullable(),
  departName: z.string().nullable(),
  laboratoryName: z.string().nullable(),
})
export const taskParamEquipmentRes = z.object({
  count: z.number(),
  data: z.array(taskParamEquipment),
})

/** 任务参数 */
export const taskParam = z.object({
  id: z.string(),
  testObjectParamId: z.string(),
  testParamId: z.string(),
  testParamDisplayName: z.string(),
}).transform(item => ({
  ...item,
  id: item.testParamId,
  name: item.testParamDisplayName,
}))

/** 检查设备使用记录冲突 */
export const checkUseLogOverlap = z.object({
  testTaskId: z.string(),
  testTaskParamId: z.string(),
  equipmentId: z.string(),
  equipmentCode: z.string().nullable(),
  equipmentName: z.string(),
  startUseTime: z.string().nullable(),
  endUseTime: z.string().nullable(),
  startUseState: z.string(),
  endUseState: z.string(),
})

/** 设备使用记录冲突的任务 */
export const overlapTask = z.object({
  testTaskCode: z.string(),
  testRecordCode: z.string(),
  userName: z.string(),
  startUseTime: z.number().nullable(),
  endUseTime: z.number().nullable(),
})

/** 设备使用记录列表 */
export type EquipmentUseRecordList = z.infer<typeof equipmentUseRecordList>

/** 设备维度 - 设备使用记录 */
export type EquipmentUseRecordEq = z.infer<typeof equipmentUseRecordEq>

/** 参数维度 - 设备使用记录 */
export type EquipmentUseRecordParam = z.infer<typeof equipmentUseRecordParam>

/** 设备使用记录 */
export type EquipmentUseLog = z.infer<typeof equipmentUseLog>

/** 任务参数绑定的物联设备 */
export type TaskParamEquipment = z.infer<typeof taskParamEquipment>

/** 任务参数 */
export type TaskParam = z.infer<typeof taskParam>

/** 检查设备使用记录冲突 */
export type CheckUseLogOverlap = z.infer<typeof checkUseLogOverlap>

/** 设备使用记录冲突的任务 */
export type OverlapTask = z.infer<typeof overlapTask>

/** 保存设备使用记录 */
export interface SaveUseLogParam {
  id?: string
  equipmentName: string
  equipmentSn: string
  equipmentCode: string
  equipmentId: string
  iotEquipmentId: string
  mac: string
  standard: string
  userName: string
  userId: string
  startUseTime: string
  endUseTime: string
  startUseState: string
  endUseState: string
  sourceFrom?: string
}
