/**
 * 特种设备检查
 */
export class CreateEqCheckEntity {
  id?: string
  /**
   * 检查项目
   */
  checkItem = ''
  /**
   * 检查结果
   */
  checkResult = ''
  /**
   * 检查时间
   */
  checkTime = ''
  /**
   * 检查类型(DAY-日检，WEEK-周检，MONTH-月检，YEAR-年检)
   */
  checkType?: CheckType
  /**
   * 检查人员
   */
  checkUser?: string
  /**
   * 检查人员
   */
  checkUserId?: string
  customValues?: CustomKeyValueVO[]
  /**
   * 逻辑删除标识
   */
  deleted?: boolean
  /**
   * 设备id
   */
  eqId?: string
  /**
   * 设备名称
   */
  eqName?: string
  /**
   * 设备编号
   */
  eqSn?: string
  /**
   * 维护意见
   */
  maintenanceOpinion = ''
  /**
   * 维护记录
   */
  maintenanceRecord = ''
  /**
   * 处理措施
   */
  measures = ''
  /**
   * 备注
   */
  remark = ''
  attachmentQrKey = generateGUID()
}

/**
 * 检查类型(DAY-日检，WEEK-周检，MONTH-月检，YEAR-年检)
 */
export enum CheckType {
  Day = 'DAY',
  Month = 'MONTH',
  Week = 'WEEK',
  Year = 'YEAR',
}

/**
 * CustomKeyValueVO
 */
export interface CustomKeyValueVO {
  customColumnId?: string
  customColumnName?: string
  customColumnValue?: string
}
