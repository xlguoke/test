import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'

/**
 * # 归档状态枚举 📝
 */
export enum EArchiveStatus {
  /** 待归档 */
  PENDING = '0',
  /** 已归档 */
  ARCHIVED = '1',
  /** 审核中 */
  AUDITING = '2',
  /** 未通过 */
  REJECTED = '3',
}

/**
 * # 归档状态字典 ⚙️
 */
export const ArchiveStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EArchiveStatus.PENDING, label: '待归档' },
  { key: EArchiveStatus.ARCHIVED, label: '已归档' },
  { key: EArchiveStatus.AUDITING, label: '审核中' },
  { key: EArchiveStatus.REJECTED, label: '未通过' },
])
