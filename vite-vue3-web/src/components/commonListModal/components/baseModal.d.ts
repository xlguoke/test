export interface optType {
  label: string
  value: string
  id?: string
}

export interface queryType {
  label?: string
  value: string
  type?: string
  options?: optType[]
}

export interface DataType {
  id: string
  [key: string]: any
}

export interface objType {
  [key: string]: any
}
