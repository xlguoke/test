import { AnyDictionaryHelper } from "@/utils/Dictionary/DictionaryHelper"

/**
 * # 试验室任务状态枚举
 */
export enum LaboratoryTaskStatus {
  /** #全部 */
  ALL = "ALL",
  /** #待检测 */
  WAITING = "WAITING",
  /** #检测中 */
  TESTING = "TESTING",
  /** #已完成 */
  FINISHED = "FINISHED"
}

/**
 * # 试验室任务状态字典
 */
export const LaboratoryTaskStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: LaboratoryTaskStatus.ALL,
    label: "全部"
  },
  {
    key: LaboratoryTaskStatus.WAITING,
    label: "待检测"
  },
  {
    key: LaboratoryTaskStatus.TESTING,
    label: "检测中"
  },
  {
    key: LaboratoryTaskStatus.FINISHED,
    label: "已完成"
  }
])

/**
 * # 子任务状态枚举
 */
export enum SubTaskStatus {
  /** 检测中 */
  TESTING = "TESTING",
  /** 已结束 */
  FINISHED = "FINISHED"
}
