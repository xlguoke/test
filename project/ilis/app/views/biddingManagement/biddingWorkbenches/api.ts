// 获取统计数据
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export enum TimeType {
  YESTERDAY = 'YESTERDAY',
  PRE_7_DAY = 'PRE_7_DAY',
  PRE_1_YEAR = 'PRE_1_YEAR',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
  ALL = 'ALL',
}

// 基础配置项类型
interface ConfigItem {
  bgColor: string
  pieColor: string
  text: string
}

// 配置键名枚举
export enum ConfigKey {
  TEST = 'TEST',
  AUDIT = 'AUDIT',
  APPROVE = 'APPROVE',
}

// 配置数据（键为枚举值，值为配置项）
export const configData: Record<ConfigKey, ConfigItem> = {
  [ConfigKey.TEST]: {
    bgColor: '#F7FAFF',
    pieColor: '#4188FF',
    text: '检测',
  },
  [ConfigKey.AUDIT]: {
    bgColor: '#FFF6F6',
    pieColor: '#FF8585',
    text: '审核',
  },
  [ConfigKey.APPROVE]: {
    bgColor: '#FFFBF7',
    pieColor: '#FFAE5E',
    text: '批准',
  },
}

// 查询我的检测
export function getPersonWorkbenchesTask(type: TimeType) {
  return IlisApiHelper.get<any>(`rest/person-workbenches/task/${type}`)
}

// 查询我的审核
export function getPersonWorkbenchesReportAudit(type: TimeType) {
  return IlisApiHelper.get<any>(`/person-workbenches/report-audit/${type}`)
}

// 查询我的批准
export function getPersonWorkbenchesReportApprove(type: TimeType) {
  return IlisApiHelper.get<any>(`/person-workbenches/report-approve/${type}`)
}

// 查询我的借用设备次数
export function getPersonWorkbenchesEquipmentRent(type: TimeType) {
  return IlisApiHelper.get<any>(`/person-workbenches/equipment-rent/${type}`)
}

// 查询我的使用设备次数
export function getPersonWorkbenchesEquipmentUse(type: TimeType) {
  return IlisApiHelper.get<any>(`/person-workbenches/equipment-use/${type}`)
}

// 查询我参与的项目统计
export function getInvolvedProjectStatistics(type: TimeType) {
  return IlisApiHelper.get<any>(`/person-workbenches/project/participation/statistics/${type}`)
}
