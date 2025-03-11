import type { ColumnsType } from 'ant-design-vue/es/table'
import type { FORM_TYPE } from '~/components/customAttribute'

export interface ICustomRecord {
  [key: string]: any
  id: '4028b2299222185301922323c67300d5'
  sysCompanyCode: 'A03'
  createName: '管理员'
  createBy: 'admin'
  createDate: 1727166400000
  updateName: null
  updateBy: null
  updateDate: null
  checkId: '4028b242921d81ab01921d8a6c94000b'
  checkedItemId: '4028b2299222185301922323c67300d4'
  detailName: '检校测试参数'
  testResult: '测试结果'
  standard: '依据标准'
  requirement: '技术要求'
  allowableDeviation: '允许偏差'
  testMaxDeviation: '校验测试最大偏差'
  conclusion: '结论'
  equipment: null
  check: null
  checkItem: null
  checkedItem: null
  customFields: null
  customValues: ICustomValues[]
}

export interface ICustomValues {
  id: '4028b2299222185301922323c68300da'
  sysCompanyCode: 'A03'
  createName: '管理员'
  createBy: 'admin'
  createDate: '2024-09-24 16:26:40'
  updateName: '管理员'
  updateBy: 'admin'
  updateDate: '2024-09-24 16:26:42'
  unitCode: 'gfzx'
  isDelete: false
  columnId: '4028b229922218530192231a37c700c1'
  columnIndex: 1
  columnName: '测试'
  visible: true
  disabled: false
  columnType: null
  columnValue: '测试'
  objectId: '4028b2299222185301922323c67300d5'
}

export interface ICustomProperties {
  [key: string]: any
  columnId: string
  id: '4028b229922357200192236fe1cc003c'
  sysCompanyCode: 'A03'
  createName: '管理员'
  createBy: 'admin'
  createDate: '2024-09-24 17:49:48'
  updateName: string
  updateBy: string
  updateDate: string
  unitCode: 'gfzx'
  isDelete: boolean
  columnIndex: number
  columnName: '测试'
  columnValue?: any
  visible: boolean
  columnType: FORM_TYPE
  customizeType: '402882c18beb618d018beb811e6602ad'
  preVisible: string | null
  defaultValue: string | number | null
}

export const columns: ColumnsType = [
  {
    title: '检校测试参数',
    dataIndex: 'detailName',
    ellipsis: true,
  },
  {
    title: '测试结果',
    dataIndex: 'testResult',
    ellipsis: true,
  },
  {
    title: '依据标准',
    dataIndex: 'standard',
    ellipsis: true,
  },
  {
    title: '技术要求',
    dataIndex: 'requirement',
    ellipsis: true,
  },
  {
    title: '允许偏差',
    dataIndex: 'allowableDeviation',
    ellipsis: true,
  },
  {
    title: '校验测试最大偏差',
    dataIndex: 'testMaxDeviation',
    ellipsis: true,
  },
  {
    title: '结论',
    dataIndex: 'conclusion',
    ellipsis: true,
  },
]
