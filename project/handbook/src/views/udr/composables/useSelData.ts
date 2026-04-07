import type { Ref } from 'vue'
import { computed, provide, ref } from 'vue'
import type { SelDataItemDTO } from '@/type/common'

export default function useSelData(config: {
  api: (q: Record<string, any>) => Promise<any>
  /** 处理返回值 */
  transferData?: (data: SelDataItemDTO[]) => SelDataItemDTO[]
  /** 查询参数 */
  query?: Ref<Record<string, any>>
  /** 分页数据，返回值属性，默认rows */
  resKey?: string
  totalKey?: string
}) {
  const selectedRows = ref<SelDataItemDTO[]>([])
  const visible = ref(false)
  const loading = ref(false)
  const total = ref(0)
  let cacheDatas: SelDataItemDTO[] = []
  const dataList = ref<SelDataItemDTO[]>([])
  const dataLength = computed(() => dataList.value.length)
  const selType = ref('radio')
  const resKey = config.resKey || 'rows'
  const totalKey = config.totalKey || 'total'

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

  function onCancel() {
    visible.value = false
    selectedRows.value = []
  }

  async function getDatas() {
    loading.value = true
    const query = config.query?.value || {}
    const res = await config.api(query)
    if (res[totalKey] === undefined) {
      if (config.transferData)
        dataList.value = config.transferData(res)
      else
        dataList.value = res
    }
    else {
      const list = res[resKey]
      if (config.transferData)
        dataList.value.push(...config.transferData(list))
      else
        dataList.value.push(...list)

      total.value = res[totalKey]
    }

    loading.value = false
  }

  function showModal(rows: SelDataItemDTO[]) {
    selectedRows.value = rows
    dataList.value = []
    visible.value = true

    getDatas()
  }

  return {
    visible,
    selType,
    cacheDatas,
    dataList,
    loading,
    total,
    selectedRows,
    getDatas,
    showModal,
    onCancel,
    onSearch,
  }
}
