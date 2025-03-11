import type { Key } from 'ant-design-vue/es/_util/type'
import { message } from 'ant-design-vue'
import type { ITableHookConfig } from '~/interface/ITableHookConfig'
import { ILISHTTPError } from '~/types'
import { AppConfig } from '~/anyThing/AppConfig'

/**
 * # 表格基础hooks（别用这个，用 useTableHooks，拆出来只是为了代码结构更清晰）
 *
 */
export function useTableBaseHooks<T extends { id: string | number, disabled?: boolean }>(config: ITableHookConfig<T>) {
  /**
   * # 加载loading
   */
  const loading = ref(false)

  /**
   * # 当前页码
   */
  const page = ref(1)

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
      const query = {
        [config.pageKey || 'page']: page.value,
        [config.sizeKey || 'size']: size.value,
        ...(config.query?.value ? config.query.value : {}),
        ...(sortQuery?.value ? sortQuery.value : {}),
        ...(config?.payload ? config.payload : {}),
      }
      for (const key in query) {
        if (query[key] === '' || query[key] === undefined)
          delete query[key]
      }
      loading.value = true
      let { data } = await config.api(query)
      if (config.responseDataTransform) {
        data = config.responseDataTransform(data)
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
    page.value = p
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
    page.value = 1
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
    page.value = 1
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
