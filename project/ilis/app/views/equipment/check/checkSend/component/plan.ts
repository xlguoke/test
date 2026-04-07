import type { ColumnsType } from 'ant-design-vue/es/table'

/**
 * # 检校计划列
 */
export const planColumns: ColumnsType = [
  {
    title: '计划名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '年/月',
    dataIndex: 'planType',
    ellipsis: true,
  },
  {
    title: '科室',
    dataIndex: 'planDepartName',
    ellipsis: true,
  },
  {
    title: '创建人',
    dataIndex: 'createName',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    ellipsis: true,
  },
  {
    title: '计划状态',
    dataIndex: 'planStatus',
    ellipsis: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
  },
]

/**
 * 设备明细表
 */
export const deviceDetailCloumns: ColumnsType = [
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
    title: '出厂编号',
    dataIndex: 'factorySn',
    ellipsis: true,
  },
  {
    title: '所属科室',
    dataIndex: 'departName',
    ellipsis: true,
  },

  {
    title: '前次检校日期',
    dataIndex: 'preCheckDate',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '前次检校结果',
    dataIndex: 'preCheckResult',
    ellipsis: true,
  },
  {
    title: '项目/参数',
    dataIndex: 'checkItemName',
    ellipsis: true,
  },
  {
    title: '计划检校日期',
    dataIndex: 'nextCheckDate',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '检校单位',
    dataIndex: 'checkUnit',
    ellipsis: true,
  },
]

// 检校计划实体数据
// eslint-disable-next-line unused-imports/no-unused-vars
const data = {
  updateDate: 1726294117000,
  planType: '2',
  planYear: '2024',
  planStatus: '10',
  remark: null,
  planMouth: '12',
  sysCompanyCode: 'A03',
  updateName: '管理员',
  planDepart: '8a8ab0b246dc81120146dc8180ba0017',
  createBy: 'admin',
  isDeleted: '0',
  updateBy: 'admin',
  planTime: 1732982400000,
  unitCode: 'gfzx',
  name: '2323',
  sysOrgCode: null,
  id: '402882c19197d2fc01919819365e02c0',
  planDepartName: '蜀道投资集团有限责任公司',
  createName: '管理员',
  createDate: 1724833675000,
}

// 检校计划设备明细实体数据
// eslint-disable-next-line unused-imports/no-unused-vars
const deviceData = {
  id: '4028b22991ef12510191ef25c8e00018',
  planId: '402882c19197d2fc01919819365e02c0',
  equipmentId: '4028b226907c3e3c01907ccb5fe7014f',
  remark: '',
  checkUnit: '23',
  assetSn: '33',
  equipmentSn: '11-副本_1',
  name: '准备外出设备',
  factorySn: '',
  standard: '55',
  departId: '2c9284d5767eda4a01768438f1f4009e',
  preCheckDate: 1710259200000,
  preCheckResult: '',
  nextCheckDate: 1683907200000,
  checkReference: null,
  testSpecifications: null,
  checkConfirmReference: null,
  checkPeriod: 5,
  checkPeriodUnit: '年',
  checkType: null,
  checkItemId: '4028b226907c3e3c01907ccc4292017d',
  checkItemName: '1111',
  storageSite: '',
  departName: '科技设备处',
  total: 1,
  count: 0,
  planName: null,
  archiveSn: '22-副本_1',
  checkItemArr: [],
}

/**
 * # 检校计划实体类型
 */
export type PlanEntity = typeof data

/**
 * # 检校计划设备明细实体类型
 */
export type PlanDeviceEntity = typeof deviceData
