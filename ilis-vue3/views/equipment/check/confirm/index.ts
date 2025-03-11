import type { ColumnsType } from 'ant-design-vue/es/table'
import { EDateFormatType } from '~/utils/EDateFormatType'

export { default as DirectConfirm } from './list.vue'

export const columns: ColumnsType = [
  {
    title: '登记批次号',
    dataIndex: 'batchNumber',
    ellipsis: true,
  },
  {
    title: '登记人员',
    dataIndex: 'createName',
    ellipsis: true,
  },
  {
    title: '所属部门',
    dataIndex: 'departName',
    ellipsis: true,
  },
  {
    title: '检校单位',
    dataIndex: 'unit',
    ellipsis: true,
  },
  {
    title: '送检日期',
    dataIndex: 'sendTime',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    ellipsis: true,
    fixed: 'right',
  },
  {
    title: '送检说明',
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
  },
]
