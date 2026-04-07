/**
 * # 部门树实体（部门选择器）
 */
export interface IOrgEntity {
  /** 注意！：该vo无id属性，请勿使用id作为判断条件 */
  id: string
  orgId: '4028b2f18846109301884662c5c501bf'
  snCategoryOrg: null
  departname: '123'
  description: ''
  isSelect: '0'
  children: IOrgEntity[]
}
