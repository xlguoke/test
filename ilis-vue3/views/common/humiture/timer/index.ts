import { type IlisAdvancedQueryConfigItem, QueryConfigType } from '~/components/IlisAdvancedQuery/index.ts'
import type { HumitureTimerListAdvancedParams } from '~/views/common/humiture/timer/api/getHumitureTimerList.ts'

export { default as Main } from './Main.vue'

// 高级查询配置
export const AdvancedQueryConfigs: IlisAdvancedQueryConfigItem<HumitureTimerListAdvancedParams>[] = [
  { label: '设置人员', name: 'createName' },
  {
    type: QueryConfigType.日期范围框,
    label: '定时控制时间',
    name: ['timerStartDate', 'timerEndDate'],
    props: {
      'value-format': EDateFormatType.YYYY_MM_DD,
    },
  },
]

/** 重复类型 */
export enum RestType {
  不重复 = 'NO',
  工作日 = 'WEEKDAY',
  自定义 = 'CUSTOM',
}

/** 控制类型 */
export enum CustomType {
  开启 = 'OPEN',
  关闭 = 'CLOSE',
  设置温湿度 = 'SET',
}

/** 定时类型 */
export enum LaboratoryIotEqType {
  功能室 = 'LAB',
  设备 = 'EQ',
  调养箱 = 'BOX',
}

/** 状态 */
export enum StatusType {
  开启 = 'OPEN',
  关闭 = 'CLOSE',
}

export enum CreateType {
  预约 = 'RES',
  定时任务 = 'TIMER',
}

/** 重复类型下拉 */
export const RestTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '不重复', key: RestType.不重复 },
  { label: '工作日', key: RestType.工作日 },
  { label: '自定义', key: RestType.自定义 },
])

/** 控制类型下拉 */
export const CustomTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '设置温湿度', key: CustomType.设置温湿度 },
  { label: '开启', key: CustomType.开启 },
  { label: '关闭', key: CustomType.关闭 },
])

/** 定时类型下拉 */
export const LaboratoryIotEqTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '功能室', key: LaboratoryIotEqType.功能室 },
  // { label: '设备', key: LaboratoryIotEqType.设备 },
  { label: '调养箱', key: LaboratoryIotEqType.调养箱 },
])

export const customDayTreeData = [{
  label: '全选',
  value: 'all',
  expand: true,
  children: [
    {
      label: '星期一',
      value: '2',
    },
    {
      label: '星期二',
      value: '3',
    },
    {
      label: '星期三',
      value: '4',
    },
    {
      label: '星期四',
      value: '5',
    },
    {
      label: '星期五',
      value: '6',
    },
    {
      label: '星期六',
      value: '7',
    },
    {
      label: '星期天',
      value: '1',
    },
  ],
}]
