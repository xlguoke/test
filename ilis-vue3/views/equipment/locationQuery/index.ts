import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'

export { default as EqLocationQuery } from './Index.vue'

/** 外出状态 */
export enum EGRESS_STATUS {
  /** 库存 */
  INVENTORY = 10,
  /** 外出待确认 */
  OUT_WAIT_CONFIRM = 20,
  /** 外出被拒绝 */
  OUT_REJECT = 30,
  /** 外出 */
  OUT = 40,
  /** 归还待确认 */
  RETURN_WAIT_CONFIRM = 50,
  /** 归还被拒绝 */
  RETURN_REJECT = 60,
  /** 外出延期 */
  OUT_DELAY = 70,
  /** 延期待确认 */
  DELAY_WAIT_CONFIRM = 80,
  /** 延期被拒绝 */
  DELAY_REJECT = 90,
}

export const EGRESS_STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: EGRESS_STATUS.INVENTORY,
    label: '库存',
  },
  {
    key: EGRESS_STATUS.OUT_WAIT_CONFIRM,
    label: '外出待确认',
  },
  {
    key: EGRESS_STATUS.OUT_REJECT,
    label: '外出被拒绝',
  },
  {
    key: EGRESS_STATUS.OUT,
    label: '外出',
  },
  {
    key: EGRESS_STATUS.RETURN_WAIT_CONFIRM,
    label: '归还待确认',
  },
  {
    key: EGRESS_STATUS.RETURN_REJECT,
    label: '归还被拒绝',
  },
  {
    key: EGRESS_STATUS.OUT_DELAY,
    label: '外出延期',
  },
  {
    key: EGRESS_STATUS.DELAY_WAIT_CONFIRM,
    label: '延期待确认',
  },
  {
    key: EGRESS_STATUS.DELAY_REJECT,
    label: '延期被拒绝',
  },
])
