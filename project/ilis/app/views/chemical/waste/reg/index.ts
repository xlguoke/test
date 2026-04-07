export { default as Main } from './Main.vue'

export enum PageStatusEnum {
  待提交 = 'CREATE',
  已提交 = 'SUBMIT',
}

export const handleStatusDict = [
  { label: '待处理', value: '1' },
  { label: '处理中', value: '2' },
  { label: '已处理', value: '3' },
]
