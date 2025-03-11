export { default as List } from './list.vue'

/**
 * # 排序方式(正序-ASC/倒序-DESC)枚举
 */
export enum OrderType {
  /**
   * # 正序
   */
  ASC = 'asc',
  /**
   * # 倒序
   */
  DESC = 'desc',
}

/**
 * ## 审核结果
 */
export enum AUDIT_STATUS {
  /**
   * ## 待审核
   */
  CREATE = 'CREATE',
  /**
   * ## 通过
   */
  PASS = 'PASS',
  /**
   * ## 不通过
   */
  FAIL = 'FAIL',
}
/**
 * ## 审核结果字典
 * {@link AUDIT_STATUS}
 */
export const AUDIT_STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: AUDIT_STATUS.CREATE,
    label: '待审核',
  },
  {
    key: AUDIT_STATUS.PASS,
    label: '已通过',
  },
  {
    key: AUDIT_STATUS.FAIL,
    label: '未通过',
  },
])

/**
 * ## 视频类型枚举
 */
export enum VIDEO_TYPE {
  /**
   * ## 样品入库
   */
  SAMPLE_IN = 'SAMPLE_IN',
  /**
   * ## 样品出库
   */
  SAMPLE_OUT = 'SAMPLE_OUT',
  /**
   * ## 试验检测
   */
  TEST = 'TEXT',
}

/**
 * ## 视频类型字典
 * {@link VIDEO_TYPE}
 */
export const VIDEO_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: VIDEO_TYPE.SAMPLE_IN,
    label: '样品入库',
  },
  {
    key: VIDEO_TYPE.SAMPLE_OUT,
    label: '样品出库',
  },
  {
    key: VIDEO_TYPE.TEST,
    label: '试验检测',
  },
])
