/**
 * 分页数据接口（适用新版本接口）
 */
export interface IPageModel<T> {
  rows: T[]
  page: number
  size: number
  total: number
}
