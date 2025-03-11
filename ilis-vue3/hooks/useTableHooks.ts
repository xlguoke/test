import type { TablePaginationConfig } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import type { TableRowSelection } from 'ant-design-vue/es/table/interface'
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { useTableHeight } from './useTableHeight'
import { useTableBaseHooks } from './useTableBaseHooks'
import type { IDeleteConfig, ITableHookConfig } from '~/interface/ITableHookConfig'
import { OrderType } from '~/interface/ITableHookConfig'
import { getChosenColumns } from '~/api/common'
import { AppConfig } from '~/anyThing/AppConfig'

/**
 * # 自定义列接口
 */
export interface ICustomColumns {
  title: string
  dataIndex: string
}

/**
 * # 表格hooks
 */
export function useTableHooks<T extends { id: string | number, disabled?: boolean }>(config: ITableHookConfig<T>) {
  const {
    loading,
    page,
    size,
    total,
    sortQuery,
    dataSource,
    lastSearchParams,
    selectedRows,
    selectedRowKeys,
    getList,
    getNextPage,
    handleSearch,
    handleReset,
    handlePageChange,
  } = useTableBaseHooks<T>(config)

  /**
   * # 指定每页可以显示多少条['10', '20', '50', '100']
   */
  const pageSizeOptions = ref(config.defaultPageSizeOptions || AppConfig.DEFAULT_PAGE_SIZE_OPTIONS)

  /**
   * # 是否分页
   */
  const isPagination = config.isPagination !== false

  /**
   * # 表格高度hooks
   */
  const { tableBoxRef, tableHeight, initTableHeight } = useTableHeight(isPagination)

  /**
   * # 自定义列配置（通过自定义列组件配置）
   */
  const customColumns = ref<ICustomColumns[]>([])

  /**
   * # 是否多选（开启行点击选中后的判断标识）
   */
  const isMultiple = ref(false)

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

  /**
   * # 导出
   * @param url 导出地址（要求该地址返回浏览器可直接下载的文件流）
   * @param payload 导出时额外携带的参数
   */
  function handleExport(url: string, payload?: Record<string, any>) {
    // 判断是否为完整文件下载链接
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url)
      return
    }
    if (!dataSource.value?.length) {
      return message.warning('暂无数据可导出')
    }
    const queryArr = Object.entries({ ...lastSearchParams.value, ...payload }).filter(([_key, value]) => {
      return value !== undefined && value !== null && value !== ''
    })
    const paramStr = new URLSearchParams(queryArr)?.toString()

    // 判断传入地址第一个字符是否为/，如果是，则去掉
    url = url.replace(/^\//, '')
    // 判断传入地址是否包含?（后端有时提供checkItemController.do?export这种接口）
    if (url.includes('?')) {
      window.open(`${import.meta.env.VITE_ILIS_BASE}/${url}&${paramStr}`)
    }
    else {
      window.open(`${import.meta.env.VITE_ILIS_BASE}/${url}?${paramStr}`)
    }
  }

  /**
   * # 删除
   */
  async function handleDelete(deleteArr: T[], deleteConfig?: IDeleteConfig) {
    if (config.delApi) {
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
          if (!config.delApi) {
            return message.error('删除接口未配置')
          }
          await config.delApi(deleteArr)
          message.success('删除成功')
          getList()
        },
      })
    }
    else {
      console.error('useTableHooks:delApi is not defined')
    }
  }

  /**
   * # 排序方法
   */
  function handleSortChange(_pagination: any, _filters: any, sorter: any) {
    const { order, field } = sorter
    if (!field) {
      return
    }
    const desc = order === 'descend' ? OrderType.DESC : OrderType.ASC
    const descStr = config.isUpperOrderType ? desc.toUpperCase() : desc
    sortQuery.value = {
      sort: order ? field : '', // 排序字段-兼容老接口的冗余字段
      orderBy: order ? field : '', // 新接口的排序字段
      order: order ? descStr : '', // 新接口的排序方式
    }
    getList()
  }

  /**
   * # 获取表格配置自定义列的已选列
   */
  async function getChosenCustomColumns(type: string) {
    const { data } = await getChosenColumns(type)
    customColumns.value = data?.map((item) => {
      return {
        title: item.columnName,
        dataIndex: item.columnKey,
      }
    }) || []
  }

  /**
   * # 重新加载表格
   */
  function handleReloadTable() {
    if (config.customType) {
      getChosenCustomColumns(config.customType)
    }
    getList()
  }

  /**
   *  # 获取分页配置
   * @returns TablePaginationConfig
   */
  function getPagination(mixinConfig?: Omit<TablePaginationConfig, 'total' | 'pageSize' | 'current' | 'onChange'>) {
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
      preserveSelectedRowKeys: config.isCacheSelect,
      onChange: (keys: Key[], rows: T[]) => {
        selectedRows.value = rows as any
        selectedRowKeys.value = keys
      },
      ...mixinConfig,
    }
  }

  // 只要不是手动指定 immediate 为 false，就自动执行一次 getList
  if (config.immediate !== false) {
    getList()
  }

  // 配置了自定义列类型的情况下，获取选中列
  if (config.customType) {
    getChosenCustomColumns(config.customType)
  }

  return {
    loading,
    page,
    size,
    total,
    dataSource,
    /**
     * # 自定义列
     * 注*需要配置 customType
     */
    customColumns,
    /** # 最后一次搜索生效的参数 */
    lastSearchParams,
    selectedRows,
    selectedRowKeys,
    tableBoxRef,
    tableHeight,
    initTableHeight,
    getList,
    getNextPage,
    getPagination,
    getRowSelection,
    getCustomRow,
    handleSearch,
    handleReset,
    handlePageChange,
    handleDelete,
    handleSortChange,
    handleExport,
    handleReloadTable,
  }
}
