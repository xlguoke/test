import type { ColumnsType } from 'ant-design-vue/es/table'
import { EDateFormatType } from '~/utils/EDateFormatType'

export { default as CheckSend } from './list.vue'

/**
 * # 送检状态
 */
export enum CheckSendStatus {
  /**
   * # 待送检
   */
  WAIT_SEND = '10',
  /**
   * # 审批中
   */
  APPROVAL = '20',
  /**
   * # 送检失败(待送检)
   */
  SEND_FAIL = '30',
  /**
   * # 已送检
   */
  SENDED = '40',
  /**
   * # 已检校
   */
  SEND_SUCESS = '50',
}

export const CheckSendStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: CheckSendStatus.WAIT_SEND, label: '待送检', color: '#bfbfbf' },
  { key: CheckSendStatus.APPROVAL, label: '审批中', color: '#bfbfbf' },
  { key: CheckSendStatus.SEND_FAIL, label: '待送检', color: '#bfbfbf' },
  { key: CheckSendStatus.SENDED, label: '已送检', color: '#00a854' },
  { key: CheckSendStatus.SEND_SUCESS, label: '已检校', color: '#00a854' },
])

export const columns: ColumnsType = [
  {
    title: '送检批号',
    dataIndex: 'batchNumber',
    width: '160px',
    ellipsis: true,
  },
  {
    title: '登记时间',
    dataIndex: 'createDate',
    width: '200px',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '登记人员',
    dataIndex: 'createName',
    width: '120px',
    ellipsis: true,
  },
  // {
  //   title: '所属部门',
  //   dataIndex: 'departName',
  //   width: '200px',
  //   ellipsis: true,
  // },
  {
    title: '检校单位',
    dataIndex: 'unit',
    width: '120px',
    ellipsis: true,
  },
  {
    title: '送检日期',
    dataIndex: 'sendTime',
    width: '120px',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '计划取回日期',
    dataIndex: 'planRetrieveTime',
    width: '120px',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '送检说明',
    dataIndex: 'remark',
    width: '120px',
    ellipsis: true,
  },
  {
    title: '送检确认日期',
    dataIndex: 'sendConfirmTime',
    width: '120px',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '120px',
    ellipsis: true,
    fixed: 'right',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    width: 320,
  },
]

export const addColumns: ColumnsType = [
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
    ellipsis: true,
  },
  {
    title: '设备名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    ellipsis: true,
  },
  {
    title: '所属科室',
    dataIndex: 'departName',
    ellipsis: true,
  },
  {
    title: '项目/参数',
    dataIndex: 'checkItemName',
    width: 180,
  },
  {
    title: '检校依据',
    dataIndex: 'checkReference',
    ellipsis: true,
  },
  {
    title: '试验规范',
    dataIndex: 'testSpecifications',
    ellipsis: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    width: 120,
  },
]

// 送检登记数据实例
// eslint-disable-next-line unused-imports/no-unused-vars
const data = {
  batchNumber: '1',
  sysOrgCode: null,
  sendConfirmTime: null,
  remark: '',
  updateName: null,
  updateDate: null,
  createBy: null,
  unit: '1',
  sendTime: '1726121400000',
  isDeleted: '0',
  sysCompanyCode: null,
  planRetrieveTime: '1726207803000',
  unitCode: null,
  id: '1',
  depart: '1',
  createDate: null,
  updateBy: null,
  status: CheckSendStatus.APPROVAL,
  createName: null,
  departName: null,
  sendDetailStr: '',
}

export type CheckSendEntity = typeof data

// const a = {
//   id: '4028b22991ef12510191ef88c0860066',
//   equipmentId: '4028b226907c3e3c01907ccb5fe7014f',
//   planCheckTime: '2023-05-13',
//   remark: '',
//   checkUnit: '23',
//   preCheckDate: '2024-03-13',
//   preCheckResult: '',
//   checkItemId: '4028b226907c3e3c01907ccc4292017d,4028b22991de95ee0191dfc3eee30053',
//   checkItemName: '1111,1',
//   checkPeriod: '5',
//   checkPeriodUnit: '年',
// }
