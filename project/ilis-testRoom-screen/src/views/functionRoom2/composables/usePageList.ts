import { Ref, ref } from "vue"
import { storeToRefs } from "pinia"
import { functionRoom2Store } from "@/store/functionRoom2"
import { message } from "ant-design-vue"

const { labData } = storeToRefs(functionRoom2Store())

export interface PageListConfig<T> {
  api: (params: any) => Promise<any>
  query: Ref<Record<string, any>>
  quickKey?: string
  beforeTransofrmResponse?: (res: T[]) => T[]
}

/** 分页查询：上滑加载 */
export function usePageList<T>(config: PageListConfig<T>) {
  const loading = ref(false)
  const finished = ref(false)
  const quickQry = ref("")
  const page = ref(0)
  const pageSize = ref(10)
  const total = ref(0)
  const dataList = ref<T[]>([])

  function onSearch(val?: string) {
    quickQry.value = val || ""
    initData()
  }

  // 初始化列表
  function initData() {
    finished.value = false
    page.value = 0
    dataList.value = []
    getList()
  }

  // 获取列表数据
  async function getList() {
    page.value++
    const params = {
      page: page.value,
      size: pageSize.value,
      labId: labData.value?.info?.id,
      [config.quickKey || "quickQry"]: quickQry.value,
      ...(config.query.value || {})
    }
    loading.value = true
    try {
      const res = await config.api(params)
      if (res.code !== 20000) {
        message.error(res.message)
        return
      }
      let { rows, count } = res.data
      total.value = count

      if (config.beforeTransofrmResponse) {
        rows = config.beforeTransofrmResponse(rows)
      }

      if (dataList.value.length === 0) {
        dataList.value = rows
      } else {
        dataList.value.push(...rows)
      }
      finished.value = dataList.value.length >= count
    } catch (err) {
      finished.value = true
      message.error((err as Error).message)
    }
    loading.value = false
  }

  return {
    loading,
    finished,
    total,
    dataList,
    onSearch,
    getList,
    initData
  }
}
