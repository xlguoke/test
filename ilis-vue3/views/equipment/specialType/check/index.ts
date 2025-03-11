import { CheckType } from '~/views/equipment/specialType/check/interface/CreateEqCheck.ts'

export { default as Main } from './Main.vue'

export const CheckTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '日检', key: CheckType.Day },
  { label: '周检', key: CheckType.Week },
  { label: '月检', key: CheckType.Month },
  { label: '年检', key: CheckType.Year },
])
