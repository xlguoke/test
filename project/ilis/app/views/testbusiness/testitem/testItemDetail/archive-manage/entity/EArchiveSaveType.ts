import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'

/**
 * # 归档存放方式枚举 📝
 * 对应 JSP 中的 saveType
 */
export enum EArchiveSaveType {
  /** 统一存放 */
  UNIFIED = '0',
  /** 分开存放 */
  SEPARATE = '1',
}

/**
 * # 归档存放方式字典 ⚙️
 */
export const ArchiveSaveTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EArchiveSaveType.UNIFIED, label: '统一存放' },
  { key: EArchiveSaveType.SEPARATE, label: '分开存放' },
])
