export { default as Standard } from './Standard.vue'
export { default as SelectedStandard } from './SelectedStandard.vue'
export type { DataSource as StandardDatas } from './api'
export { STANDARD_TYPE, STANDARD_TYPE_DICT, SOURCE_TYPE, SOURCE_TYPE_DICT } from '~/types/standard'

/**
 * # 排序方式(正序-ASC/倒序-DESC)枚举
 */
export enum OrderType {
  /**
   * # 正序
   */
  ASC = 'ASC',
  /**
   * # 倒序
   */
  DESC = 'DESC',
}

/**
 * ## 布尔类型
 */
export enum BOOLEAN_OPT {
  /** 是 */
  TRUE = '1',
  /** 否 */
  FALSE = '0',
  /** 全部 */
  ALL = '',
}

/**
 * ## 布尔字典
 */
export const BOOLEAN_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    label: '是',
    key: BOOLEAN_OPT.TRUE,
  },
  {
    label: '否',
    key: BOOLEAN_OPT.FALSE,
  },
  {
    label: '全部',
    key: BOOLEAN_OPT.ALL,
  },
])
