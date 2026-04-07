/** ## 费用折扣模式：附加费用是否参与折扣计算 */
export enum EFeeDiscountMode {
  /** ## 附加费用不参与折扣计算 */
  NO = 0,
  /** ## 附加费用参与折扣计算 */
  YES = 1,
}

/** ## 编号生成策略 */
export enum EGenerateCode {
  /** ## 生成委托编号 */
  CONSIGN_CODE = '1',
  /** ## 生成样品编号 */
  SAMPLE_CODE = '2',
  /** ## 生成来样编号 */
  RECEIVE_CODE = '3',
  /** ## 手动生成样品编号 */
  MANUAL_CODE = '2000',
  /** ## 点击生成样品编号时自动保存委托 */
  AUTO_SAVE = 'AutoSave',
}

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

/** ## 保存委托方式：默认为点击保存按钮保存 */
export enum EConsignSaveType {
  /** 完成委托 */
  FINISH = '1',
  /** 生成委托编号 */
  GENERATE_CODE = '2',
}

/** 见证信息类型 */
export enum EWitnessType {
  /** 建设单位见证人 */
  BUILD = '1',
  /** 监理单位见证人 */
  SUPERVISION = '2',
}
