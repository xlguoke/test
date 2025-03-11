import type { AxiosResponse } from 'axios'

/**
 * # useLocalTableHooks 配置参数
 */
export interface ILocalTableHookConfig<T> {
  /**
   * # 请求api
   * 配置后触发搜索时从服务端重新获取表格数据
   * @param q
   */
  api?: (q?: any) => Promise<AxiosResponse<T[]>>

  /**
   * # 本地列表数据（优先级大于api）
   * 配置后触发搜索时仅从本地数据中过滤数据
   */
  dataSource?: Ref<T[]>

  /**
   * # 删除api（配置后走接口删除，没配置就本地删除）
   */
  delApi?: (q: T[]) => Promise<AxiosResponse<T[]>>

  /**
   * # 是否开启本地搜索
   * - 默认触发搜索时从服务端重新获取表格数据
   * - 配置了isLocalSerch为true，则触发搜索时仅从本地数据中过滤数据
   */
  isLocalSerch?: boolean

  /**
   * # 模糊搜索字段映射
   * [字段名, [该字段的映射字符集合]]
   */
  quickQueryMap?: [key: string, map: string[]]

  /**
   * # 初始获取列表数据时携带的查询参数
   */
  payload?: Record<string, any>

  /**
   * # 是否立即请求（默认为true，配置api后生效）
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
   * # 删除前的钩子
   */
  beforeDelete?: (deleteArr: T[]) => Promise<boolean>
}
