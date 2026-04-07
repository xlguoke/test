/**
 * ## 规程类型
 */
export enum STANDARD_TYPE {
  /** 检测依据/评定标准 */
  ALL = '3',
  /** 检测依据 */
  BASIS = '1',
  /** 评定标准 */
  STANDARD = '2',
  /** 无使用规程 */
  NONE = '0',
}

/**
 * ## 规程类型字典
 */
export const STANDARD_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    label: '检测依据/评定标准',
    key: STANDARD_TYPE.ALL,
  },
  {
    label: '检测依据',
    key: STANDARD_TYPE.BASIS,
  },
  {
    label: '评定标准',
    key: STANDARD_TYPE.STANDARD,
  },
])

/**
 * ## 是否系统规程
 */
export enum SOURCE_TYPE {
  /** 系统规程 */
  SYS = '1',
  /** 用户规程 */
  USER = '2',
  /** 全部 */
  ALL = '',
}

/**
 * ## 是否系统规程字典
 */
export const SOURCE_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    label: '系统规程',
    key: SOURCE_TYPE.SYS,
  },
  {
    label: '用户规程',
    key: SOURCE_TYPE.USER,
  },
  {
    label: '全部',
    key: SOURCE_TYPE.ALL,
  },
])
