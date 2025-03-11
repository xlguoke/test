import type { FormExpose } from 'ant-design-vue/es/form/Form'
import type { AxiosResponse } from 'axios'

/**
 * # 排序类型
 */
export enum OrderType {
  /**
   * # 正序
   */
  ASC = 'asc',
  /**
   * # 倒序
   */
  DESC = 'desc',
}

export interface IDeleteConfig {
  /**
   * # 删除提示
   */
  title?: string
  /**
   * # 删除内容
   */
  content?: string
  /**
   * # 确认按钮文字
   */
  okText?: string
  /**
   * # 取消按钮文字
   */
  cancelText?: string
}

/**
 * # useTableHooks 配置参数
 */
export interface ITableHookConfig<T> {
  /**
   * # 请求api
   * @param q
   */
  api: (q?: any) => Promise<AxiosResponse<any>>

  /**
   * # 删除api
   * @param q
   */
  delApi?: (q: T[]) => Promise<AxiosResponse<any>>

  /**
   * # 表格自定义列类型
   */
  customType?: string

  /**
   * # 表单ref
   */
  formRef?: Ref<FormExpose | undefined>

  /**
   * # 查询参数ref
   */
  query?: Ref<Record<string, any>>

  /**
   * # 搜索/重置触发时固定携带的查询参数（不受 query 影响）
   */
  payload?: Record<string, any>

  /**
   * # 是否立即请求
   */
  immediate?: boolean

  /**
   * # 默认分页尺寸
   */
  defaultPageSize?: number

  /**
   * # 指定每页可以显示多少条['10', '20', '50', '100']
   */
  defaultPageSizeOptions?: string[] | number[]

  /**
   * # 总数字段
   */
  totalKey?: string

  /**
   * # 行数据字段
   */
  rowsKey?: string

  /**
   * # 列表数据字段
   */
  pageKey?: string

  /**
   * # 当前页码字段
   */
  sizeKey?: string

  /**
   * # 是否分页查询
   */
  isPagination?: boolean

  /**
   * # 是否采用大写的排序枚举（默认小写）
   * @description 为了兼容现有后端
   */
  isUpperOrderType?: boolean

  /**
   * # 是否缓存选中数据
   */
  isCacheSelect?: boolean

  /**
   * # 接口返回数据后赋值前的钩子
   */
  responseDataTransform?: (res: Record<string, any>) => Record<string, any>

  /**
   * # 删除前的钩子
   */
  beforeDelete?: (deleteArr: T[]) => Promise<boolean>
}
