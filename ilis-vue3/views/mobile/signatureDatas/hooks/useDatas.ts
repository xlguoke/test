import type { AxiosResponse } from 'axios'
import { CONSIGN_SIGN_TYPE } from '~/components/onlineSignature'

export interface Pages<T> {
  rows: T[]
  count: number
}

interface Opt<T> {
  /** 签字状态：tab标签的name值 */
  status: Ref<string>
  /** 获取数据列表的方法 */
  dataApi: () => Promise<AxiosResponse<Pages<T>>>
  /** 数据处理 */
  responseDataTransform?: (data: Pages<T>) => Pages<T>
}

export function useDatas<T>(opt: Opt<T>) {
  const dataSource: Ref<T[]> = ref([])
  const total = ref(1) // 初始值不设为0，才会显示加载中，并自动加载数据
  const loading = ref(false)
  const selectedRows = ref<T[]>([])
  const size = 20
  const page = ref(0)

  const showSignature = ref(false)
  const isAttachments = computed(() => selectedRows.value.some((d: any) => d.identity !== CONSIGN_SIGN_TYPE.CONSIGN))

  /**
   * ## 切换tab标签刷新数据
   */
  watch(() => opt.status.value, () => {
    onRefresh()
  })

  /**
   * ## 刷新数据
   */
  function onRefresh() {
    selectedRows.value = []
    dataSource.value = []
    page.value = 0
    total.value = 0
    onLoad()
  }

  /**
   * ## 加载数据
   */
  async function onLoad() {
    loading.value = true
    page.value++
    try {
      let { data } = await opt.dataApi()
      if (opt.responseDataTransform) {
        data = opt.responseDataTransform(data)
      }
      dataSource.value.push(...data.rows)
      total.value = data.count
    }
    catch (err) {
      // 总数设为0，否则会死循环一直请求数据
      total.value = 0
      console.error(err)
    }
    loading.value = false
  }

  /**
   * ## 修改选中项
   */
  function onChange(rows: any) {
    selectedRows.value = rows
  }

  /**
   * 签字
   */
  function openSignature() {
    const rows = selectedRows.value
    if (rows.length === 0) {
      showNotify({ type: 'warning', message: '请选择需要签字的数据' })
      return ''
    }
    showSignature.value = true
  }

  return {
    showSignature,
    isAttachments,
    page,
    size,
    dataSource,
    total,
    loading,
    selectedRows,
    onLoad,
    onRefresh,
    onChange,
    openSignature,
  }
}
