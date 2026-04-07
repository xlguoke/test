import type { AnyBaseModel } from '../model/AnyBaseModel'

export interface IGroupConfig<T extends AnyBaseModel> {
  /** # 分组名称 */
  name?: string
  /** # 分组描述 */
  description?: string
  /** # 分组字段列表 */
  fieldList?: (keyof T)[]
  /** # 分组使用类型（form：表单，table：表格，search：搜索；不指定表示所有类型都可用） */
  usedType?: 'form' | 'table' | 'search'
}
