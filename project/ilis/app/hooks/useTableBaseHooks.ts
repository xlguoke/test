import type { Key } from 'ant-design-vue/es/_util/type'
import type { ITableHookConfig } from '~/interface/ITableHookConfig'
import { message } from 'ant-design-vue'
import { AppConfig } from '~/anyThing/AppConfig'
import { ILISHTTPError } from '~/types'

/**
 * # 表格基础hooks（别用这个，用 useTableHooks，拆出来只是为了代码结构更清晰）
 *
 */
export function useTableBaseHooks<T extends { id: string | number, disabled?: boolean }>(config: ITableHookConfig<T>) {
  /**
   * # 加载loading
   */
  const loading = ref(false)

  /** # 初始页码 */
  const initialPage = config.initialPage === 0 ? 0 : 1

  /**
   * # 当前页码
   */
  const page = ref(initialPage)

  /**
   * # 每页条数
   */
  const size = ref(config.defaultPageSize || AppConfig.DEFAULT_PAGE_SIZE)

  /**
   * # 总条数
   */
  const total = ref(0)

  /**
   * # 表格数据
   */
  const dataSource: Ref<T[]> = ref([])

  /**
   * # 选中行key的集合
   */
  const selectedRowKeys = ref<Key[]>([])

  /**
   * # 选中行数据集合
   */
  const selectedRows: Ref<T[]> = ref([])

  /**
   * # 最后一次搜索生效的搜索参数
   */
  const lastSearchParams = ref<Record<string, any>>({})

  /**
   * # 是否分页
   */
  const isPagination = config.isPagination !== false

  /**
   * # 排序参数(不对外暴露)
   */
  const sortQuery = ref<Record<string, any>>({})

  /**
   * # 获取列表数据
   */
  async function getList() {
    try {
      if (!isPagination) {
        size.value = 999999
      }
      for (const key in config.query?.value || {}) {
        if (config.query?.value[key] === '' || config.query?.value[key] === undefined)
          delete config.query?.value[key]
      }
      let payload = isRef(config.payload) ? config.payload.value : config.payload
      if (!payload) {
        payload = {}
      }
      let query: Record<string, any> = {
        ...(payload && config.payloadCoverable ? payload : {}), // 额外携带的参数可被覆盖
        ...(config.query?.value ? config.query.value : {}),
        [config.pageKey || 'page']: page.value,
        [config.sizeKey || 'size']: size.value,
        ...(sortQuery?.value ? sortQuery.value : {}),
        ...(payload && !config.payloadCoverable ? payload : {}), // 额外携带的参数不可被覆盖
      }
      for (const key in query) {
        if (query[key] === '' || query[key] === undefined)
          delete query[key]
      }
      if (config.beforeSearch) {
        query = config.beforeSearch(query)
      }
      loading.value = true
      let { data } = await config.api(query)
      if (config.responseDataTransform) {
        data = await config.responseDataTransform(data)
      }
      lastSearchParams.value = query
      dataSource.value = data[config.rowsKey || 'rows']
      total.value = data[config.totalKey || 'total']
      if (!config.isCacheSelect) {
        refreshSelectedRows()
      }
      loading.value = false
    }
    catch (error: any) {
      loading.value = false
      if (error instanceof ILISHTTPError) {
        message.error(error.message)
      }
      else {
        throw error
      }
    }
  }

  function refreshSelectedRows() {
    selectedRows.value = dataSource.value.filter(item => selectedRowKeys.value.includes(item.id))
    // 目前发现通过行点击选中的数据，翻页后无法正常清除，所以手动清除一下
    selectedRowKeys.value = selectedRows.value.map(item => item.id)
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
    page.value = initialPage === 1 ? p : p - 1
    size.value = s
    getList()
  }

  /**
   * # 查询
   */
  function handleSearch(query?: Record<string, any>) {
    if (query) {
      config.query = ref({
        ...(config.query?.value || {}),
        ...query,
      })
    }
    page.value = initialPage
    getList()
  }

  /**
   * # 重置
   */
  function handleReset(query?: Record<string, any>) {
    if (query) {
      config.query = ref({
        ...query,
      })
    }
    config.formRef?.value?.resetFields()
    page.value = initialPage
    if (!config.isCacheSelect) {
      selectedRows.value = []
      selectedRowKeys.value = []
    }
    getList()
  }

  return {
    loading,
    page,
    size,
    total,
    sortQuery,
    dataSource,
    /** # 最后一次搜索生效的参数 */
    lastSearchParams,
    selectedRows,
    selectedRowKeys,
    getList,
    getNextPage,
    handleSearch,
    handleReset,
    handlePageChange,
  }
}
