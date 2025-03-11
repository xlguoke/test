import { describe, expect, it } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { flushPromises } from '@vue/test-utils'
import { useLocalTableHooks } from './useLocalTableHooks' // 假设这是文件的实际路径
import type { ILocalTableHookConfig } from '~/interface/ILocalTableHookConfig'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

// 模拟一个简单的测试接口
const mock = new MockAdapter(ilisAxios)

class TestEntity extends AnyDataBaseEntity {
  name?: string
  includesKey?: string
  exactKey?: string
}

const responseData = TestEntity.fromJsonArray([
  { id: '1', name: 'John Doe', includesKey: '相似的', exactKey: '完全相同' },
  { id: '2', name: 'max', includesKey: '包含相似的', exactKey: '包含完全相同' },
  { id: '3', name: 'iasdukn', includesKey: '不一样的', exactKey: '完全不同' },
  { id: '4', name: 'Johnkkku', includesKey: '相似的', exactKey: 'exactKey' },
  { id: '5', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '6', name: 'John', includesKey: '相似的', exactKey: 'exactKey' },
  { id: '7', name: 'John', includesKey: '相似的', exactKey: 'exactKey' },
  { id: '8', name: 'John', includesKey: '相似的', exactKey: 'exactKey' },
  { id: '9', name: 'John', includesKey: '相似的', exactKey: 'exactKey' },
  { id: '10', name: 'John', includesKey: '相似的', exactKey: 'exactKey' },
  { id: '11', name: 'John', includesKey: '相似的', exactKey: 'exactKey' },
  { id: '12', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '13', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '14', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '15', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '16', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '17', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '18', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '19', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '20', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '21', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '22', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '23', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '24', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '25', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '26', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
  { id: '27', name: 'xaskjdJohn', includesKey: '完全不同', exactKey: 'testexactKey' },
])

// 模拟 GET 请求
mock.onGet('/listData').reply(200, responseData)

describe('useLocalTableHooks', () => {
  it('should define the expected properties and methods width api', async () => {
    const mockConfig: ILocalTableHookConfig<AnyDataBaseEntity> = {
      api: () => ilisAxios.get('/listData'),
    }

    const {
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
      handleSearch,
      handleReset,
      handlePageChange,
      handleDelete,
      handleReloadTable,
    } = useLocalTableHooks(mockConfig)

    // 检查是否正常工作
    expect(loading.value).toEqual(true)
    expect(page.value).toBe(1)
    expect(size.value).toBe(10)
    expect(total.value).toBe(0)
    expect(dataSource.value).toEqual([])
    expect(dataSourceAll.value).toEqual([])
    expect(selectedRows.value).toEqual([])
    expect(selectedRowKeys.value).toEqual([])
    expect(tableBoxRef).toBeDefined()
    expect(tableHeight.value).toBeDefined()
    expect(getList).toBeDefined()
    expect(getPagination).toBeDefined()
    expect(getRowSelection).toBeDefined()
    expect(handleSearch).toBeDefined()
    expect(handleReset).toBeDefined()
    expect(handlePageChange).toBeDefined()
    expect(handleDelete).toBeDefined()
    expect(handleReloadTable).toBeDefined()
    await flushPromises()
    expect(dataSourceAll.value).toEqual(responseData)
    expect(dataSource.value).toEqual(responseData.slice(0, 10))
  })
  it('should define the expected properties and methods width dataSource', async () => {
    const mockConfig: ILocalTableHookConfig<AnyDataBaseEntity> = {
      dataSource: ref(responseData),
    }
    const { dataSourceAll, dataSource } = useLocalTableHooks(mockConfig)
    expect(dataSourceAll.value).toEqual(responseData)
    expect(dataSource.value).toEqual(responseData.slice(0, 10))
  })

  it('should handle delete correctly widthout delApi', async () => {
    const { handleDeleteDirect, dataSourceAll, dataSource } = useLocalTableHooks<any>({
      dataSource: ref(responseData),
    })
    await handleDeleteDirect([{ id: '8', name: 'John', includesKey: '相似的', exactKey: 'exactKey' }])
    await flushPromises()
    expect(dataSourceAll.value).toEqual(responseData.filter(item => item.id !== '8'))
    expect(dataSource.value).toEqual(responseData.filter(item => item.id !== '8').slice(0, 10))
  })

  it('should handlePageChange correctly', async () => {
    const { handlePageChange, dataSource } = useLocalTableHooks<any>({
      dataSource: ref(responseData),
    })
    handlePageChange(2, 10)
    await flushPromises()
    expect(dataSource.value).toEqual(responseData.slice(10, 20))
  })

  it('should handleSearch exact correctly width api', async () => {
    mock.onGet('/listDataSearch').reply(200, responseData.filter(item => item.exactKey === 'testexactKey'))
    const { handleSearch, dataSource, handlePageChange } = useLocalTableHooks<any>({
      api: () => ilisAxios.get('/listDataSearch'),
    })
    handleSearch({ exactKey: 'testexactKey' })
    await flushPromises()
    expect(dataSource.value).toEqual(responseData.filter(item => item.exactKey === 'testexactKey').slice(0, 10))
    handlePageChange(2, 10)
    await flushPromises()
    expect(dataSource.value).toEqual(responseData.filter(item => item.exactKey === 'testexactKey').slice(10, 20))
  })

  it('should handleSearch exact and page correctly width api', async () => {
    mock.onGet('/listDataSearch').reply(200, responseData.filter(item => item.exactKey === 'testexactKey'))
    const { handleSearch, dataSource, handlePageChange, page } = useLocalTableHooks<any>({
      api: () => ilisAxios.get('/listDataSearch'),
    })
    handlePageChange(2, 10)
    expect(page.value).toEqual(2)
    handleSearch({ exactKey: 'testexactKey' })
    await flushPromises()
    expect(page.value).toEqual(1)
    expect(dataSource.value).toEqual(responseData.filter(item => item.exactKey === 'testexactKey').slice(0, 10))
  })

  it('should handleSearch exact correctly width dataSource', async () => {
    const { handleSearch, dataSource, handlePageChange } = useLocalTableHooks<any>({
      dataSource: ref(responseData),
    })
    handleSearch({ exactKey: 'testexactKey' })
    await flushPromises()
    expect(dataSource.value).toEqual(responseData.filter(item => item.exactKey === 'testexactKey').slice(0, 10))
    handlePageChange(2, 10)
    await flushPromises()
    expect(dataSource.value).toEqual(responseData.filter(item => item.exactKey === 'testexactKey').slice(10, 20))
  })

  it('should handleSearch exact and page correctly width dataSource', async () => {
    const { handleSearch, dataSource, handlePageChange, page } = useLocalTableHooks<any>({
      dataSource: ref(responseData),
    })
    handlePageChange(2, 10)
    expect(page.value).toEqual(2)
    handleSearch({ exactKey: 'testexactKey' })
    await flushPromises()
    expect(page.value).toEqual(1)
    expect(dataSource.value).toEqual(responseData.filter(item => item.exactKey === 'testexactKey').slice(0, 10))
  })
})
