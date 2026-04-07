import type { EDataType } from '../enum'

export * from './test-param'

/**
 * ## 下拉列表项
 * @description 下拉列表字段的选项项
 */
export interface IListValueItem {
  /** ## 选项值 */
  value: string
  /** ## 选项显示文本 */
  desc: string
}

/**
 * ## 检测参数信息（嵌套对象）
 * @description 参数过程信息中关联的检测参数
 */
export interface ITestParam {
  /** ## 检测参数ID */
  id?: string
  /** ## 检测参数名称 */
  name?: string
  /** ## 显示名称 */
  displayName?: string
  /** ## 参数编码 */
  code?: string
  /** ## 检测项目ID */
  testItemId?: string
  /** ## 检测项目名称 */
  testItemName?: string
  /** ## 大类信息 */
  bigCategory?: {
    /** ## 大类ID */
    id?: string
    /** ## 大类名称 */
    name?: string
    /** ## 大类编码 */
    code?: string
  }
}

/**
 * ## 参数过程信息 DTO
 * @description 对应接口 /test/param/inter 的数据结构
 */
export interface IParamProcessDTO {
  /** ## 主键ID */
  id?: string
  /** ## 检测项目ID */
  testItemId?: string
  /** ## 检测参数ID */
  testParamId?: string
  /** ## 检测参数信息（嵌套对象） */
  testParam?: ITestParam
  /** ## 系统ID */
  testParamSystemId?: string
  /** ## 名称 */
  name?: string
  /** ## 数据类型 */
  dataType?: EDataType
  /** ## 下拉列表（数组） */
  listValue?: IListValueItem[]
  /** ## 默认值 */
  defaultValue?: string
  /** ## 排序号 */
  orderNo?: number
  /** ## 备注 */
  memo?: string
}

/**
 * ## 新增参数过程信息请求
 * @description 用于批量新增操作
 */
export interface ICreateParamProcessRequest {
  /** ## 检测参数ID集合 */
  testParamsId: string[]
  /** ## 名称 */
  name: string
  /** ## 数据类型 */
  dataType: EDataType
  /** ## 下拉列表（数组） */
  listValue?: IListValueItem[]
  /** ## 默认值 */
  defaultValue?: string
  /** ## 排序号 */
  orderNo?: number
  /** ## 备注 */
  memo?: string
}

/**
 * ## 更新参数过程信息请求
 * @description 用于单条数据更新
 */
export interface IUpdateParamProcessRequest {
  /** ## 检测项目ID */
  testItemId: string
  /** ## 检测参数ID */
  testParamId: string
  /** ## 系统ID */
  testParamSystemId: string
  /** ## 名称 */
  name: string
  /** ## 数据类型 */
  dataType: EDataType
  /** ## 下拉列表（数组） */
  listValue?: IListValueItem[]
  /** ## 默认值 */
  defaultValue?: string
  /** ## 排序号 */
  orderNo?: number
  /** ## 备注 */
  memo?: string
}

/**
 * ## 参数过程信息分页查询参数
 */
export interface IParamProcessQueryParam {
  /** ## 参数名称（模糊查询） */
  paramName?: string
  /** ## 参数ID集合，多个用逗号分隔 */
  testParamIds?: string
  /** ## 页码 */
  page?: number
  /** ## 每页大小 */
  size?: number
}

/**
 * ## 参数过程信息分页响应
 * @description Spring Data 分页格式
 */
export interface IParamProcessPageResDTO {
  /** ## 数据列表 */
  content: IParamProcessDTO[]
  /** ## 总元素数 */
  totalElements: number
  /** ## 总页数 */
  totalPages: number
  /** ## 每页大小 */
  size: number
  /** ## 当前页码（从0开始） */
  number: number
  /** ## 是否为空 */
  empty: boolean
  /** ## 是否为第一页 */
  first: boolean
  /** ## 是否为最后一页 */
  last: boolean
  /** ## 当前页元素数 */
  numberOfElements: number
  /** ## 排序信息 */
  sort: any
  /** ## 分页信息 */
  pageable: any
}
