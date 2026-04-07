import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'

/**
 * # 下载类型枚举 📝
 */
export enum EDownloadType {
  /** 报告 */
  REPORT = '10',
  /** 记录 */
  RECORD = '20',
  /** 其它附件 */
  ATTACHMENT = '30',
  /** 复核审批意见 */
  APPROVAL = '40',
  /** 委托单 */
  CONSIGN = '50',
  /** 任务分配单 */
  TASK_ASSIGN = '60',
}

/**
 * # 下载类型字典 ⚙️
 */
export const DownloadTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EDownloadType.REPORT, label: '报告' },
  { key: EDownloadType.RECORD, label: '记录' },
  { key: EDownloadType.ATTACHMENT, label: '其它附件' },
  { key: EDownloadType.APPROVAL, label: '复核审批意见' },
  { key: EDownloadType.CONSIGN, label: '委托单' },
  { key: EDownloadType.TASK_ASSIGN, label: '任务分配单' },
])
