export { default as ScreenManage } from './list.vue'

export const columns = [
  {
    title: '屏幕编号',
    dataIndex: 'sn',
    key: 'sn',
  },
  {
    title: '屏幕名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '屏幕类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '数据刷新频率',
    dataIndex: 'frequencyRefresh',
    key: 'frequencyRefresh',
  },
  {
    title: '轮播切换频率',
    dataIndex: 'frequencyCarousel',
    key: 'frequencyCarousel',
  },
  {
    title: '更新时间',
    dataIndex: 'updateDate',
    key: 'updateDate',
    customRender: ({ record }: any) => {
      return record.updateDate || record.createDate
    },
  },
  {
    title: '更新人',
    dataIndex: 'updateName',
    key: 'updateName',
    customRender: ({ record }: any) => {
      return record.updateName || record.createName
    },
  },
  {
    title: '屏幕状态',
    dataIndex: 'enabled',
    key: 'enabled',
    customRender: ({ text }: any) => {
      return text ? '启用' : '停用'
    },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    width: 140,
  },
]

// 屏配置数据实体
// eslint-disable-next-line unused-imports/no-unused-vars
const data = {
  id: '4692808190e9e8730190e9ee9f250000',
  sysCompanyCode: 'A03',
  createName: '管理员',
  createBy: 'admin',
  createDate: '2024-07-25 20:47:28',
  updateName: null,
  updateBy: null,
  updateDate: null,
  unitCode: 'gfzx',
  name: '屏名称',
  sn: '屏编号',
  type: '屏类型',
  url: '',
  frequencyRefresh: 0,
  frequencyCarousel: 0,
  enabled: true,
  screenUrl: '',
  businessId: '',
  businessName: '',
  bindType: '',
}

// 屏类型字典数据实体
// eslint-disable-next-line unused-imports/no-unused-vars
const screenTypeData = {
  id: 'SMART_SCREEN_TYPE_01',
  typeGroupId: 'SMART_SCREEN_TYPE',
  parentType: null,
  typename: '设备屏',
  typecode: 'SMART_SCREEN_TYPE_EQ',
  createDate: 1721982133000,
  createName: 'LILF',
  sonTypes: [],
}

export type ScreenConfigEntity = typeof data
export type ScreenTypeEntity = typeof screenTypeData

/** 绑定对象类型 */
export enum BindType {
  /** 功能室 */
  LAB = 'LAB',
  /** 设备 */
  EQU = 'EQU',
}

export interface ScreenTemplate {
  title: string
  url: string
  bindType?: BindType
  multiple: boolean
  paramKey?: string
}

// export const screenBaseUrl = 'http://localhost:8082/#/'
// export const screenBaseUrl = `http://localhost:9527/index.html#/`
export const screenBaseUrl = `${location.origin}/-/facility-inspection-system/index.html#/`

/**
 * 屏配置列表
 */
export const screenList: ScreenTemplate[] = [
  {
    title: '座式屏',
    url: `hallSeatScreen`,
    multiple: false,
  },
  {
    title: '设备小屏',
    url: `deviceSmallScreen`,
    bindType: BindType.EQU,
    multiple: false,
    paramKey: 'ids',
  },
  {
    title: '功能室大屏',
    url: `cutRoomScreen`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'id',
  },
  {
    title: '功能室门口屏',
    url: `functionRoom/testRoom`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'labId',
  },
  {
    title: '标准物质间',
    url: `functionRoom/standardRoom`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'labId',
  },
  {
    title: '化学药品室',
    url: `functionRoom/chemistryRoom`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'labId',
  },
  {
    title: '标准养护室',
    url: `functionRoom/maintainRoom`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'labId',
  },
  {
    title: '样品室',
    url: `functionRoom/sampleRoom`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'labId',
  },
  {
    title: '留样室',
    url: `functionRoom/retainSampleRoom`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'labId',
  },
  {
    title: '外检室',
    url: `functionRoom/externalTestRoom`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'labId',
  },
  {
    title: '外检室数据大屏',
    url: `outRoomScreen`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'labId',
  },
  {
    title: '室内屏',
    url: `functionRoom2`,
    bindType: BindType.LAB,
    multiple: false,
    paramKey: 'labId',
  },
]
