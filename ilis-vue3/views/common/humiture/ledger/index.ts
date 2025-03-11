export { default as Main } from './Main.vue'

export enum LedgerStatusType {
  待提交 = '10',
  审核中 = '20',
  审核不通过 = '30',
  审核通过 = '40',
}

export const LedgerStatusTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '待处理', key: LedgerStatusType.待提交 },
  { label: '审核中', key: LedgerStatusType.审核中 },
  { label: '已退回', key: LedgerStatusType.审核不通过 },
  { label: '已完成', key: LedgerStatusType.审核通过 },
])
