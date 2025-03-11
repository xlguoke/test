import type { HumitureRecordListParams } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import { type IlisAdvancedQueryConfigItem, QueryConfigType } from '~/components/IlisAdvancedQuery/index.ts'

export { default as Main } from './Main.vue'

// 高级查询配置
export const AdvancedQueryConfigs: IlisAdvancedQueryConfigItem<HumitureRecordListParams>[] = [
  {
    type: QueryConfigType.日期范围框,
    label: '记录时间',
    name: ['recordStartDate', 'recordEndDate'],
    props: {
      'value-format': EDateFormatType.YYYY_MM_DD,
    },
  },
]

/**
 * 湿度状态 OVER超标 NORMAL正常 LOWER过低
 */
export enum MStatus {
  过低 = 'LOWER',
  正常 = 'NORMAL',
  超标 = 'OVER',
}

/**
 * 巡查模式 AUTO自动 MANUAL手动
 */
export enum Type {
  自动 = 'AUTO',
  手动 = 'MANUAL',
}

/** 湿度状态下拉 */
export const MStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '超标', key: MStatus.超标 },
  { label: '正常', key: MStatus.正常 },
  // { label: '过低', key: MStatus.过低 },
  { label: '超标', key: MStatus.过低 },
])

/** 巡查模式下拉 */
export const TypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '自动', key: Type.自动 },
  { label: '手动', key: Type.手动 },
])
