import { isDefined } from "@vueuse/core"
import { onMounted, onUnmounted, Ref } from "vue"

interface UseAutoRequestHooksOption {
  immediate?: boolean
  loading?: Ref<boolean, boolean>
  chartLoading?: Ref<any, any>
  api: (query: any) => Promise<any>
  setData?: (res: any) => void
  query?: Ref<any, any>
  delay?: number
}

/**
 * 定时请求
 */
const useAutoRequestHooks = (option: UseAutoRequestHooksOption) => {
  const immediate = isDefined(option.immediate) ? option.immediate : true
  const loading = option.loading
  const chartLoading = option.chartLoading
  const api = option.api
  const setData = option.setData
  const query = option.query
  const delay = option.delay || 1000 * 60 * 5

  const timers: NodeJS.Timeout[] = []

  async function getData(useLoading = true) {
    timers.forEach((tid) => {
      clearTimeout(tid)
    })

    if (useLoading) {
      if (loading) {
        loading.value = true
      }

      if (chartLoading) {
        chartLoading.value.showLoading()
      }
    }

    const res = await api(query ? query.value : undefined)
      .finally(() => {
        if (useLoading) {
          if (loading) {
            loading.value = false
          }

          if (chartLoading) {
            chartLoading.value.hideLoading()
          }
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {})

    if (res) {
      setData && setData(res)
    }

    timers.push(
      setTimeout(() => {
        getData(false)
      }, delay)
    )
  }

  onMounted(() => {
    if (immediate) {
      getData()
    }
  })

  onUnmounted(() => {
    timers.forEach((tid) => {
      clearTimeout(tid)
    })
  })

  return async function () {
    return getData()
  }
}

export { useAutoRequestHooks }
