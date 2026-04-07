export interface IlisFormExpose<T> {
  getFormData: () => Promise<T>
  checkedFormKeys: string[]
  handleChange: (val: any, field: string) => void
}

/** # 自定义标记模块枚举 */
export enum CustomMarkManagePage {
  /** # 委托收样 */
  MANAGE_ASSIGN_PAGE = 'MANAGE_ASSIGN_PAGE',
  /** # 试验检测 */
  MANAGE_TEST_PAGE = 'MANAGE_TEST_PAGE',
  /** # 报告管理 */
  MANAGE_REPORT_PAGE = 'MANAGE_REPORT_PAGE',
}

/** # 自定义标记范围枚举 */
export enum CustomMarkRange {
  /** # 委托管理 */
  CONSIGN = 'CONSIGN',
  /** # 任务分配 */
  ASSIGN = 'ASSIGN',
  /** # 试验任务 */
  TASK = 'TASK',
  /** # 试验复核 */
  REVIEW = 'REVIEW',
  /** # 编制报告 */
  EDIT = 'EDIT',
  /** # 报告审核 */
  AUDIT = 'AUDIT',
  /** # 报告批准 */
  APPROVE = 'APPROVE',
  /** # 报告打印 */
  PRINT = 'PRINT',
  /** # 报告发放 */
  GRANT = 'GRANT',
}

/** # 自定义标记类型枚举（标记的时候需要传递） */
export enum MarkTypeCode {
  /** # 样品 */
  OBJECT = 'OBJECT',
  /** # 任务 */
  TASK = 'TASK',
  /** # 报告 */
  REPORT = 'REPORT',
}
