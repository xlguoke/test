export interface optType {
  label: string
  value: string
  id?: string
}

export interface queryType {
  label?: string
  value: string
  type?: "input" | "select" // 查询表单类型：input、select
  options?: optType[]
}

export interface DataType {
  id: string
  [key: string]: any
}

export interface HttpOptionType {
  url: string
  method?: string
}
