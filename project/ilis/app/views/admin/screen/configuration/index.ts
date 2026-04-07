import { ScreenTemplateType } from '../templateManagement/ScreenTemplateEntity'

export { default as ScreenManage } from './list.vue'

export const columns: any[] = [
  {
    title: '授权状态',
    dataIndex: 'authorized',
    key: 'authorized',
    width: 120,
  },
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
    title: '模板类型',
    dataIndex: 'templateName',
    key: 'templateName',
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
    title: '授权过期日期',
    dataIndex: 'authExpireDate',
    key: 'authExpireDate',
    customRender: ({ record }: any) => {
      if (record.license) {
        return record.license.authExpireDate || '-'
      }
      return '-'
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
  templateId: '',
  templateName: '',
  systemType: ScreenTemplateType.DISPLAY_SYSTEM,
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
  paramKey?: string
}

/** # 屏路由枚举 */
export enum ScreenRouter {
  /** # 座式屏 */
  HallSeatScreen = 'hallSeatScreen',
  /** # 设备小屏 */
  DeviceSmallScreen = 'deviceSmallScreen',
  /** # 功能室大屏 */
  CutRoomScreen = 'cutRoomScreen',
  /** # 功能室门口屏 */
  TestRoom = 'functionRoom/testRoom',
  /** # 标准物质间 */
  StandardRoom = 'functionRoom/standardRoom',
  /** # 化学药品室 */
  ChemistryRoom = 'functionRoom/chemistryRoom',
  /** # 标准养护室 */
  MaintainRoom = 'functionRoom/maintainRoom',
  /** # 样品室 */
  SampleRoom = 'functionRoom/sampleRoom',
  /** # 留样室 */
  RetainSampleRoom = 'functionRoom/retainSampleRoom',
  /** # 外检室 */
  ExternalTestRoom = 'functionRoom/externalTestRoom',
  /** # 外检室数据大屏 */
  OutRoomScreen = 'outRoomScreen',
  /** # 外检室数据大屏（无地图） */
  OutRoomScreenWithoutMap = 'outRoomScreenWithoutMap',
  /** # 室内屏 */
  FunctionRoom2 = 'functionRoom2',
}

function getScreenBaseUrl() {
  const o = location.origin

  if (o === 'http://localhost:8080') {
    return 'http://localhost:8082/#/'
  }
  return `${o}/-/facility-inspection-system/index.html#/`
}

export const screenBaseUrl = getScreenBaseUrl()

/**
 * 屏配置列表
 */
export const screenList: ScreenTemplate[] = [
  {
    title: '座式屏',
    url: ScreenRouter.HallSeatScreen,
  },
  {
    title: '设备小屏',
    url: ScreenRouter.DeviceSmallScreen,
    bindType: BindType.EQU,
    paramKey: 'ids',
  },
  {
    title: '功能室大屏',
    url: ScreenRouter.CutRoomScreen,
    bindType: BindType.LAB,
    paramKey: 'id',
  },
  {
    title: '功能室门口屏',
    url: ScreenRouter.TestRoom,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
  {
    title: '标准物质间',
    url: ScreenRouter.StandardRoom,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
  {
    title: '化学药品室',
    url: ScreenRouter.ChemistryRoom,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
  {
    title: '标准养护室',
    url: ScreenRouter.MaintainRoom,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
  {
    title: '样品室',
    url: ScreenRouter.SampleRoom,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
  {
    title: '留样室',
    url: ScreenRouter.RetainSampleRoom,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
  {
    title: '外检室',
    url: ScreenRouter.ExternalTestRoom,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
  {
    title: '外检室数据大屏',
    url: ScreenRouter.OutRoomScreen,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
  {
    title: '外检室数据大屏（无地图）',
    url: ScreenRouter.OutRoomScreenWithoutMap,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
  {
    title: '室内屏',
    url: ScreenRouter.FunctionRoom2,
    bindType: BindType.LAB,
    paramKey: 'labId',
  },
]
