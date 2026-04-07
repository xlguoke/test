/**
 * 委托收样用到的枚举类型数据
 */

/** ## 委托状态 */
export enum CONSIGN_STATUS {
  /** 填写中 10 */
  WRITE = '10',
  /** 已完成 20 */
  FINISH = '20',
  /** 退回修改 40 */
  RETURN = '40',
  /** 有样品退回 45 */
  SAMPLE_RETURN = '45',
  /** 通知修改 50 */
  EDIT = '50',
  /** 已作废 30 */
  CANCEL = '30',
}
/** ## 委托状态字典 */
export const consignStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: CONSIGN_STATUS.WRITE,
    label: '填写中',
  },
  {
    key: CONSIGN_STATUS.FINISH,
    label: '已完成',
  },
  {
    key: CONSIGN_STATUS.RETURN,
    label: '退回修改',
  },
  {
    key: CONSIGN_STATUS.SAMPLE_RETURN,
    label: '有样品退回',
  },
  {
    key: CONSIGN_STATUS.EDIT,
    label: '通知修改',
  },
  {
    key: CONSIGN_STATUS.CANCEL,
    label: '已作废',
  },
])

/** ## 项目性质 */
export const projectNatureDict = AnyDictionaryHelper.createDictionaryArray([
  { key: '自营项目', label: '自营项目' },
  { key: '协作项目', label: '协作项目' },
])

/** ## 检测类型 */
export enum CONSIGN_TYPE {
  /** 现场检测 */
  SITE = '1',
  /** 原材料检测 */
  ROW_MATERIAL = '0',
}
/** ## 检测类型字典 */
export const consignTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: CONSIGN_TYPE.SITE, label: '现场检测' },
  { key: CONSIGN_TYPE.ROW_MATERIAL, label: '原材料检测' },
])

/** ## 数据来源 */
export enum CONSIGN_ORIGIN {
  /** 创建委托 */
  CREATE = '1',
  /** 创建综合任务 */
  CREATE_TEST = '2',
  /** 预委托平台 */
  PRE_CONSIGN = '3',
}
/** ## 数据来源字典 */
export const consignOriginDict = AnyDictionaryHelper.createDictionaryArray([
  { key: CONSIGN_ORIGIN.CREATE, label: '创建委托' },
  { key: CONSIGN_ORIGIN.CREATE_TEST, label: '创建综合任务' },
  { key: CONSIGN_ORIGIN.PRE_CONSIGN, label: '预委托平台' },
])

/** ## 缴费状态 */
export enum CONSIGN_PAY_STATUS {
  /** 已结清 */
  ALL = '1',
  /** 部分缴费 */
  PART = '2',
  /** 未缴费 */
  NONE = '3',
}
/** ## 缴费状态字典 */
export const feeStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: CONSIGN_PAY_STATUS.ALL, label: '已结清' },
  { key: CONSIGN_PAY_STATUS.PART, label: '部分缴费' },
  { key: CONSIGN_PAY_STATUS.NONE, label: '未缴费' },
])

/** ## 列筛选 */
export enum ConsignCustomColumn {
  /** 委托信息列 */
  CONSIGN_INFO = 'consignTable',
  /** 样品信息列 */
  SAMPLE_INFO = 'objectTable',
  /** 委托台账列(按委托导出) */
  CONSIGN_LEDGER = 'consignLedger',
  /** 委托台账列(按样品导出) */
  SAMPLE_LEDGER = 'objectLedger',
}
