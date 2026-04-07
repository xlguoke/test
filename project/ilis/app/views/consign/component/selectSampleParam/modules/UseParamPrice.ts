/**
 * ## 参数价格
 * 1. 顺序代表优先级
 */
export enum PRICE_TYPE {
  /** 脚本单价 */
  SCRIPT = 4,
  /** 共享单价 */
  SHARE = 3,
  /** 样品单价 */
  SAMPLE = 0,
  /** 参数单价 */
  PRICE = 1,
  /** 子价格 */
  CHILD = 2,
  /** 自定义价格：前端标记使用，被删除或占位 */
  CUSTOM = -1,
}

/** 参数价格类型 */
export type PriceType = PRICE_TYPE.CHILD | PRICE_TYPE.PRICE | PRICE_TYPE.SAMPLE | PRICE_TYPE.SHARE | PRICE_TYPE.SCRIPT | PRICE_TYPE.CUSTOM

export const PRICE_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    label: '脚本价格',
    key: PRICE_TYPE.SCRIPT,
  },
  {
    label: '共用价格',
    key: PRICE_TYPE.SHARE,
  },
  {
    label: '样品价格',
    key: PRICE_TYPE.SAMPLE,
  },
  {
    label: '参数价格',
    key: PRICE_TYPE.PRICE,
  },
  {
    label: '子价格',
    key: PRICE_TYPE.CHILD,
  },
])
export class ParamPriceItem {
  /** 价格id */
  id = ''
  /** 参数id */
  paramId?: string
  /** 价格类型 */
  type: PriceType = PRICE_TYPE.PRICE
  /** 价格 */
  price = 0
  /** 描述 */
  qualifier?: string
  /** 参数脚本描述 */
  scriptDescription?: string
  /** 版本id */
  standardId?: string
  remark?: string

  /** 前端控制参数 */
  _disabled?: boolean
  selected?: boolean
}
