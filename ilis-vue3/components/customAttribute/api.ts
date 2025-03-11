import type { FORM_TYPE } from './'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface Query {
  /** 自定义属性类型 */
  customizeType: string
  /** 模糊查询 */
  queryName?: string
}

export interface AddEditData {
  id?: string | number
  columnIndex: number
  columnName: string
  columnType: FORM_TYPE
  columnValue?: string[]
  defaultValue?: string
  customizeType: string
  visible: boolean
  isDelete?: boolean
}

/**
 * # 查询自定义属性
 */
export function getPageList(query: Query) {
  return IlisApiHelper.get<any>(`rest/common/custom-properties`, query)
}

/**
 * ## 保存
 */
export function saveApi(data: AddEditData) {
  const method = data.id ? 'put' : 'post'
  return IlisApiHelper[method]<any>(`rest/common/custom-property`, {
    ...data,
    columnValue: data.columnValue?.join(','),
  })
}

/**
 * ## 删除
 */
export function deleteApi(ids: string) {
  return IlisApiHelper.delete<any>(`rest/common/custom-properties?ids=${ids}`)
}

/**
 * ## 自定义列
 */
export interface CustomColumn {
  id: string
  columnKey: string
  columnName: string
  displayName: null
  module: string
  sequence: number
}

export function getCustomColumnApi(type: string) {
  return IlisApiHelper.get<CustomColumn[]>(`rest/common/default-columns?type=${type}`)
}
