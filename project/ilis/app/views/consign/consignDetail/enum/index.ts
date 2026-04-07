export * from './EEventEmit'

/** 样品状态 */
export enum SampleStatus {
  /** 已分配 */
  ASSIGNED = '1',
  /** 回退 */
  ROLLBACK = '2',
  /** 已分包 */
  SUBCONTRACTED = '3',
  /** 废弃 */
  ABANDONED = '4',
}
