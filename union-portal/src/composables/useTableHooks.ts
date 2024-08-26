import type { Ref } from 'vue'
import type { FormInstance, TablePaginationConfig } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import type { TableRowSelection } from 'ant-design-vue/es/table/interface'
import useTableHeight from './useTableHeight'
import useMyFetch from '@/composables/useMyFetch'
import type { PageRes } from '@/types/pagination.d'

interface TableHookConfig<T> {
  /**
   * # 请求api
   */
  api: string

  /**
   * # 表单ref
   */
  formRef?: Ref<FormInstance | undefined>

  /**
   * # 查询参数ref
   */
  query?: Ref<Record<string, any>>
  /**
   * 查询参数的sql匹配方式，需要精确匹配的字段通过 eqQuery 传入，未传入的默认为模糊查询
   * 暂无范围查询的参数，未实现范围查询匹配
   */
  eqQuery?: string[]
  /**
   * # 是否分页
   */
  isPagination?: boolean
  /**
   * 初始化时是否自动加载列表数据
   */
  isInitData?: boolean
  /**
   * # 过滤数据
   * 对数据进行自定义处理，返回处理后的数据
   */
  filterData?: (d: T[]) => T[]
}

/**
 * # 表格hooks
 */
export function useTableHooks<T>(config: TableHookConfig<T>) {
  /**
   * # 加载loading
   */
  const loading = ref(false)

  const isInitData = config.isInitData === undefined ? true : !!config.isInitData

  /**
   * 是否分页
   */
  const isPagination = config.isPagination === undefined ? true : !!config.isPagination

  /**
   * # 当前页码
   */
  const page = ref(1)

  /**
   * # 每页条数
   */
  const size = ref(10)

  /**
   * # 总条数
   */
  const total = ref(0)

  /**
   * # 表格数据
   */
  const dataSource = ref([] as T[])

  /**
   * # 选中行key的集合
   */
  const selectedRowKeys = ref<Key[]>([])

  /**
   * # 选中行数据集合
   */
  const selectedRows = ref<T[]>([])

  /**
   * 初始化表格高度
   */
  const { tableBoxRef, tableHeight } = useTableHeight(isPagination)

  function initQuery() {
    return isPagination
      ? {
          page: page.value - 1,
          size: size.value,
          search: '',
        }
      : {
          search: '',
        }
  }

  /**
   * # 获取列表数据
   */
  async function getList() {
    const query = initQuery()

    // 拼接列表查询条件
    if (config.query?.value) {
      let q = ``
      const eq = config.eqQuery || []
      for (const key in config.query.value) {
        const val = config.query.value[key]
        if (val) {
          q += eq.includes(key) ? `${key}==${val},` : `${key}==*${val}*,`
        }
      }
      query.search = q.slice(0, -1)
    }
    
    loading.value = true
    const { data, error } = await useMyFetch<PageRes<T>>(config.api, { params: query })
    if (!error.value) {
      let list = data.value?.content || []
      if (config.filterData)
        list = config.filterData(list)
      dataSource.value = list
      total.value = data.value?.page.totalElements || 0
    }
    loading.value = false
  }

  /**
   * # 获取下一页数据
   */
  async function getNextPage() {
    if (page.value * size.value >= total.value) {
      return Promise.resolve({
        noMore: true,
      })
    }
    page.value++
    await getList()
    return Promise.resolve({
      noMore: false,
    })
  }

  /**
   * # 分页改变
   * @param p 页码
   * @param s 展示条数
   */
  function handlePageChange(p: number, s: number) {
    page.value = p
    size.value = s
    getList()
  }

  /**
   * # 查询
   */
  function handleSearch() {
    page.value = 1
    getList()
  }

  /**
   * # 重置
   */
  function handleReset() {
    config.formRef?.value?.resetFields()
    page.value = 1
    getList()
  }

  /**
   *  # 获取分页配置
   * @returns TablePaginationConfig
   */
  function getPagination() {
    if (!isPagination)
      return false
    return {
      total: total.value,
      pageSize: size.value,
      current: page.value,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total: number) => `共 ${total} 条数据`,
      onChange: handlePageChange,
    } as unknown as TablePaginationConfig
  }

  /**
   * # 获取表格行选择配置
   */
  function getRowSelection(mixinConfig?: Omit<TableRowSelection<T>, 'selectedRowKeys' | 'onChange'>) {
    return {
      selectedRowKeys: selectedRowKeys.value,
      preserveSelectedRowKeys: true,
      onChange: (keys: Key[], rows: T[]) => {
        selectedRows.value = rows as any
        selectedRowKeys.value = keys
      },
      ...mixinConfig,
    }
  }

  if (isInitData)
    getList()

  return {
    loading,
    page,
    size,
    total,
    dataSource,
    selectedRows,
    selectedRowKeys,
    tableBoxRef,
    tableHeight,
    getList,
    getNextPage,
    getPagination,
    getRowSelection,
    handleSearch,
    handleReset,
    handlePageChange,
  }
}
