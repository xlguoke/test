import { computed, provide, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import type { SelDataItemDTO } from '@/type/common'
import selDataCached from '@/stores/selDataCached'

export default function useSelData() {
  const route = useRoute()
  const selectedRows = ref<SelDataItemDTO[]>([])
  const loading = ref(false)
  const total = ref(0)
  let cacheDatas: SelDataItemDTO[] = []
  const dataList = ref<SelDataItemDTO[]>([])
  const dataLength = computed(() => dataList.value.length)
  const selType = ref('radio')

  // rollingloading 组件使用
  provide('loading', loading)
  provide('total', total)
  provide('dataLength', dataLength)

  function onSearch(keyword: string) {
    if (cacheDatas.length === 0)
      cacheDatas = dataList.value

    if (keyword) {
      const list = cacheDatas.filter(item => item.name.includes(keyword))
      dataList.value = list
    }
    else { dataList.value = cacheDatas }
  }

  function initSelectedItems() {
    const rows = selDataCached().getDefaultSelData(route.name as string)
    if (rows && rows.length > 0)
      selectedRows.value = rows
  }

  const selectedItems = ref()
  function confirmSelected(datas: SelDataItemDTO[]) {
    if (selType.value === 'checkbox') {
      selDataCached().addSelData(route.name as string, datas)
    }
    else {
      const item = datas[0]
      selectedItems.value = {
        ...item,
        id: item.id,
        name: item.name,
      }
    }
  }

  onBeforeRouteLeave((to) => {
    to.params[route.name as string] = selectedItems.value
  })

  return {
    selType,
    cacheDatas,
    dataList,
    loading,
    total,
    selectedRows,
    selectedItems,
    route,
    onSearch,
    initSelectedItems,
    confirmSelected,
  }
}
