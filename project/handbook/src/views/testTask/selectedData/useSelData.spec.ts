import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import selDataCached from '@/stores/selDataCached'
import type { SelDataItemDTO } from '@/type/common'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    name: 'SelStandard',
  })),
  onBeforeRouteLeave: vi.fn((callback) => {
    callback({ params: {} })
  }),
}))

describe('useSelData 核心逻辑', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockData: SelDataItemDTO[] = [
    { id: '1', name: '标准1' },
    { id: '2', name: '标准2' },
    { id: '3', name: '标准3' },
  ]

  describe('initSelectedItems 初始化', () => {
    it('多选模式：应直接设置selectedRows', async () => {
      const { default: useSelData } = await import('./useSelData')
      const store = selDataCached()
      store.addDefaultSelData('SelStandard', mockData)

      const { selType, selectedRows, initSelectedItems } = useSelData()
      selType.value = 'checkbox'

      initSelectedItems()

      expect(selectedRows.value).toEqual(mockData)
    })

    it('单选模式：应直接设置selectedRows', async () => {
      const { default: useSelData } = await import('./useSelData')
      const store = selDataCached()
      store.addDefaultSelData('SelStandard', [mockData[0]])

      const { selType, selectedRows, initSelectedItems } = useSelData()
      selType.value = 'radio'

      initSelectedItems()

      expect(selectedRows.value).toEqual([mockData[0]])
    })

    it('无默认数据时：selectedRows为空', async () => {
      const { default: useSelData } = await import('./useSelData')

      const { selType, selectedRows, initSelectedItems } = useSelData()
      selType.value = 'checkbox'

      initSelectedItems()

      expect(selectedRows.value).toEqual([])
    })
  })

  describe('confirmSelected 确认选择', () => {
    it('多选模式：应更新selectedRows和store', async () => {
      const { default: useSelData } = await import('./useSelData')

      const { selType, selectedRows, confirmSelected, initSelectedItems } = useSelData()
      selType.value = 'checkbox'

      initSelectedItems()
      confirmSelected([mockData[0], mockData[1]])

      expect(selectedRows.value).toEqual([mockData[0], mockData[1]])
    })

    it('单选模式：应设置selectedItems', async () => {
      const { default: useSelData } = await import('./useSelData')

      const { selType, selectedItems, confirmSelected } = useSelData()
      selType.value = 'radio'

      confirmSelected([mockData[0]])

      expect(selectedItems.value).toEqual({
        id: mockData[0].id,
        name: mockData[0].name,
      })
    })
  })
})
