import { type IlisAdvancedQueryConfigItem, QueryConfigType } from '~/components/IlisAdvancedQuery/index.ts'
import type { GetPurchaseListParams } from '~/views/common/purchaseRequest/interface/purchaseList.ts'

export { default as Main } from './Main.vue'

const commonCheckColumns = [
  { title: '规格', dataIndex: 'standard' },
  { title: '数量', dataIndex: 'amount', width: '120px' },
  { title: '单位', dataIndex: 'unit', width: '120px' },
  { title: '备注', dataIndex: 'description', ellipsis: true },
]

// 高级查询配置
export const AdvancedQueryConfigs: IlisAdvancedQueryConfigItem<GetPurchaseListParams>[] = [
  {
    type: QueryConfigType.树选择框,
    label: '申请部门',
    name: 'requestDepartmentId',
    props: {
      fieldNames: {
        label: 'text',
        value: 'id',
      },
      treeDefaultExpandAll: true,
    },
  },
  { label: '申请人', name: 'applicant', props: { maxLength: 10 } },
  {
    type: QueryConfigType.日期范围框,
    label: '申请日期',
    name: ['requestDateStart', 'requestDateEnd'],
    props: {
      'value-format': EDateFormatType.YYYY_MM_DD,
    },
  },
]

/** 申请类型 */
export enum RequestType {
  耗材 = 'CONSUMABLE',
  化学品 = 'CHEMICAL',
  其他 = 'OTHER',
}

/** 申请状态 */
export enum RequestStatusType {
  填写中 = 'IN_FILLING',
  待提交 = 'PENDING_SUBMIT',
  审核中 = 'UNDER_REVIEW',
  未通过 = 'NOT_APPROVED',
  已完成 = 'COMPLETED',
}

export const RequestTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '耗材采购申请', key: RequestType.耗材 },
  { label: '化学品采购申请', key: RequestType.化学品 },
  { label: '其他采购申请', key: RequestType.其他 },
])

export const RequestStatusDict = AnyDictionaryHelper.createDictionaryArray([
  // { label: '填写中', key: RequestStatusType.填写中 },
  { label: '待提交', key: RequestStatusType.待提交 },
  { label: '审核中', key: RequestStatusType.审核中 },
  { label: '未通过', key: RequestStatusType.未通过 },
  { label: '已完成', key: RequestStatusType.已完成 },
])

export function getRequestType() {
  const urlParams = new URLSearchParams(location.search)
  const requestType = urlParams.get('requestType') as RequestType
  return requestType
}

export function getColumnsByType(requestType: RequestType) {
  if (requestType === RequestType.耗材) {
    return [
      { title: '管理编号', dataIndex: 'code' },
      { title: '耗材名称', dataIndex: 'name' },
    ].concat(commonCheckColumns)
  }

  if (requestType === RequestType.化学品) {
    return [
      { title: '化学名称', dataIndex: 'name' },
      { title: '化学品编号', dataIndex: 'code' },
    ].concat(commonCheckColumns)
  }

  return commonCheckColumns
}
