import type { Key } from 'ant-design-vue/es/_util/type'
import type { TablePaginationConfig } from 'ant-design-vue'
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import type { TableRowSelection } from 'ant-design-vue/es/table/interface'
import { useTableHeight } from './useTableHeight'
import type { ILocalTableHookConfig } from '~/interface/ILocalTableHookConfig'
import type { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import type { IDeleteConfig } from '~/interface/ITableHookConfig'

/**
 * # localTableHooks
 * - 提供本地分页、搜索能力，适用于表格数据量少且不需要服务端分页、搜索
 * - 可传入列表数据或传入获取不分页列表数据的接口
 */
export function useLocalTableHooks<T extends AnyDataBaseEntity>(config: ILocalTableHookConfig<T>) {
  /**
   * # 查询参数（本地查询）
   */
  const searchQuery = ref<Record<string, any>>({})

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
  const size = ref(config.defaultPageSize || 10)

  /**
   * # 指定每页可以显示多少条['10', '20', '50', '100']
   */
  const pageSizeOptions = ref(config.defaultPageSizeOptions || ['10', '20', '50', '100'])

  /**
   * # 总条数
   */
  const total = ref(0)

  const isMultiple = ref(false)

  /**
   * # 表格数据（全部）
   */
  const dataSourceAll: Ref<T[]> = ref([])

  /**
   * # 表格数据（本地分页、搜索过滤后的）
   * - 支持通过匹配字符模糊搜索
   * - 支持通过匹配字符精确搜索
   */
  const dataSource = computed(() => {
    let searched = dataSourceAll.value
    if (!config.api) {
      // 模糊匹配
      if (config.quickQueryMap) {
        const [key, map] = config.quickQueryMap
        if (searchQuery.value[key]) {
          const searchQueryObj = Object.fromEntries(map.map(k => [k, searchQuery.value[key]]))
          searched = filterDataSource(searched, searchQueryObj, 'includes')
        }
      }
      // 精确匹配(匹配前移除模糊匹配字符)
      let searchQueryKeys = Object.keys(searchQuery.value)
      if (config.quickQueryMap) {
        const [key, _map] = config.quickQueryMap
        searchQueryKeys = searchQueryKeys.filter(item => item !== key)
      }
      if (searchQueryKeys.length > 0) {
        const searchQueryObj = Object.fromEntries(searchQueryKeys.map(key => [key, searchQuery.value[key]]))
        searched = filterDataSource(searched, searchQueryObj, 'exact')
      }
    }

    const start = (page.value - 1) * size.value
    const end = start + size.value
    handleResetSelectedRows()
    total.value = searched.length
    return searched.slice(start, end)
  })

  /**
   * # 过滤数据源
   */
  function filterDataSource(dataSource: T[], queryObj: Record<string, any>, matchType: 'includes' | 'exact') {
    return dataSource.filter((item) => {
      if (matchType === 'includes') {
        return Object.entries(queryObj).some(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            return true
          }
          try {
            return item[key]?.toString().toLowerCase().includes(value?.toString().trim().toLowerCase())
          }
          catch (error: any) {
            console.error(`Error in filterDataSource: ${error.message}`)
            return false
          }
        })
      }
      else {
        return Object.entries(queryObj).every(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            return true
          }
          try {
            return item[key].toString() === value.toString()?.trim()
          }
          catch (error: any) {
            console.error(`Error in filterDataSource: ${error.message}`)
            return false
          }
        })
      }
    })
  }

  /**
   * # 选中行key的集合
   */
  const selectedRowKeys = ref<Key[]>([])

  /**
   * # 选中行数据集合
   */
  const selectedRows: Ref<T[]> = ref([])

  /**
   * # 表格高度hooks
   */
  const { tableBoxRef, tableHeight } = useTableHeight()

  /**
   * # 初始获取列表数据（全部）
   * 仅在初始化和通过接口删除后调用
   */
  async function getList() {
    if (!config.dataSource && !config.api) {
      return console.error('useLocalTableHooks：请传入dataSource或api')
    }

    loading.value = true
    if (config.dataSource) {
      dataSourceAll.value = config.dataSource.value
    }
    else if (config.api) {
      const query = {
        ...searchQuery.value,
        ...(config?.payload ? config.payload : {}),
      }
      const { data } = await config.api(query)
      dataSourceAll.value = data
    }
    total.value = dataSourceAll.value.length
    loading.value = false
  }

  /**
   * # 分页改变
   * @param p 页码
   * @param s 展示条数
   */
  function handlePageChange(p: number, s: number) {
    page.value = p
    size.value = s
  }

  /**
   * # 查询
   */
  function handleSearch(query?: Record<string, any>) {
    searchQuery.value = {
      ...query,
    }
    page.value = 1
    if (config.api) {
      getList()
    }
  }

  /**
   * # 重置
   */
  function handleReset(query?: Record<string, any>) {
    searchQuery.value = {
      ...query,
    }
    page.value = 1
    handleResetSelectedRows()
    if (config.api) {
      getList()
    }
  }

  /**
   * # 重置清空选中行
   */
  function handleResetSelectedRows() {
    selectedRows.value = []
    selectedRowKeys.value = []
  }

  /**
   * # 删除（进行前置判断、确认问询）
   */
  async function handleDelete(deleteArr: T[], deleteConfig?: IDeleteConfig) {
    if (!deleteArr?.length) {
      message.warning('请选择要删除的数据')
      return
    }
    // 执行删除前的钩子（通常用于二次确认、删除前的检查等）
    if (config.beforeDelete) {
      const isDelete = await config.beforeDelete(deleteArr)
      if (!isDelete) {
        return
      }
    }
    Modal.confirm({
      title: deleteConfig?.title || '确认要删除数据吗?',
      icon: createVNode(ExclamationCircleOutlined),
      content: deleteConfig?.content || '删除后数据无法恢复',
      centered: true,
      okText: deleteConfig?.okText || '确认',
      cancelText: deleteConfig?.cancelText || '取消',
      async onOk() {
        handleDeleteDirect(deleteArr)
      },
    })
  }

  /**
   * # 直接删除（直接删除数据，不做前置判断与询问）
   */
  async function handleDeleteDirect(deleteArr: T[]) {
    if (config.delApi) {
      await config.delApi(deleteArr)
      getList()
    }
    else {
      dataSourceAll.value = dataSourceAll.value.filter((item) => {
        return !deleteArr.some(delItem => delItem.id === item.id)
      })
      config.dataSource!.value = dataSourceAll.value
    }
    message.success('删除成功')
  }

  /**
   * # 重新加载表格
   */
  function handleReloadTable() {
    getList()
  }

  /**
   *  # 获取分页配置
   * @returns TablePaginationConfig
   */
  function getPagination(mixinConfig?: Omit<TablePaginationConfig, 'total' | 'pageSize' | 'current' | 'onChange'>) {
    return {
      total: total.value,
      pageSize: size.value,
      current: page.value,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total: number) => `共 ${total} 条数据`,
      onChange: handlePageChange,
      pageSizeOptions: pageSizeOptions.value,
      ...mixinConfig,
    } as unknown as TablePaginationConfig
  }

  /**
   * # 获取表格行选择配置
   */
  function getRowSelection(mixinConfig?: Omit<TableRowSelection<T>, 'selectedRowKeys' | 'onChange'>) {
    isMultiple.value = mixinConfig?.type !== 'radio'
    return {
      selectedRowKeys: selectedRowKeys.value,
      onChange: (keys: Key[], rows: T[]) => {
        selectedRows.value = rows as any
        selectedRowKeys.value = keys
      },
      ...mixinConfig,
    }
  }

  /**
   * 点击行选择事件
   */
  function getCustomRow(record: T) {
    return {
      onClick: () => {
        if (record.disabled)
          return
        if (isMultiple.value) {
          const ind = selectedRowKeys.value.findIndex(d => d === record.id)
          if (ind === -1) {
            selectedRowKeys.value.push(record.id)
            selectedRows.value.push(record)
          }
          else {
            selectedRowKeys.value.splice(ind, 1)
            selectedRows.value.splice(ind, 1)
          }
        }
        else {
          selectedRowKeys.value = [record.id]
          selectedRows.value = [record]
        }
      },
    }
  }

  // 只要不是手动指定 immediate 为 false，就自动执行一次 getList
  if (config.immediate !== false) {
    getList()
  }

  return {
    loading,
    page,
    size,
    total,
    dataSource,
    dataSourceAll,
    selectedRows,
    selectedRowKeys,
    tableBoxRef,
    tableHeight,
    getList,
    getPagination,
    getRowSelection,
    getCustomRow,
    handleSearch,
    handleReset,
    handlePageChange,
    handleDelete,
    handleDeleteDirect,
    handleReloadTable,
  }
}
