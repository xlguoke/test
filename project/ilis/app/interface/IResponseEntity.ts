/** 分页格式 */
export interface IResponsePageEntity<T> {
  total?: number
  count?: number
  rows: T[]
}

/** 旧版接口格式 */
export interface IResponseOldEntity<T> {
  attributes?: string
  listData?: any
  fail: boolean
  success: boolean
  jsonStr?: string
  obj: T
}

/** 旧版列表接口格式 */
export interface IResponseOldRowsEntity<T> {
  attributes?: string
  listData?: any
  fail: boolean
  success: boolean
  jsonStr?: string
  obj: IResponsePageEntity<T>
}

/** 新版接口通用格式 */
export interface IResponseCommonEntity<T> {
  code: number
  data: T
}

/** 新版列表接口格式 */
export interface IResponseNewRowsEntity<T> {
  code: number
  data: IResponsePageEntity<T>
}
