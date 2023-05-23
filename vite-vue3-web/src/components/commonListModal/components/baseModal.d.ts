export interface optType {
  label: string
  value: string
  id?: string
}

export interface queryType {
  label?: string
  value: string
  type?: string // 查询表单类型：input、select
  options?: optType[]
}

export interface DataType {
  id: string
  [key: string]: any
}

export interface HttpOptionType {
  url: string
  method?: string
  pageZero?: boolean // 分页是否从 0 开始
  params?: T<object>
  // 分页参数属性
  pagesKey?: {
    page: string
    pageSize: string
  }
}
