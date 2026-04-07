import { generateGUID } from '~/utils/gen'

export enum SSE_TYPE {
  /** 公告 */
  NOTICE = 'notice',
  /** 进度 */
  PROGRESS = 'progress',
}

export interface SSE_OPTION<T> {
  /** sse连接类型 */
  type: SSE_TYPE
  /** 业务key，需要保证每个使用场景唯一 */
  businessKey: Ref<string>
  /** 业务类型，需要保证每个使用场景唯一 */
  businessType?: string
  /** 连接成功回调 */
  onopen?: (event: Event) => void
  /** 连接成功后推送信息回调 */
  onmessage?: (data: T) => void
  /** 连接失败回调 */
  onerror?: (err: Error) => void
}

const SSE_API: any = {
  // 公告
  notice: '/ilis2/rest/noticeController/announcement?businessKey=',
  // 进度条
  progress: '/ilis2/rest/progress',
}

function getBusinessKey(key: string) {
  for (const k in sessionStorage) {
    if (k === key) {
      return sessionStorage.getItem(k) || ''
    }
  }
  const uuid = generateGUID()
  sessionStorage.setItem(key, uuid)
  return uuid
}

/**
 * 连接sse服务
 */
export function useConnectSSE<T>(opt: SSE_OPTION<T>) {
  let eventSource: any = null
  let eventSourceUrl: string = ''
  const sseData = ref<T>()
  const businessKey = computed(() => opt.businessKey.value)
  function initSSE() {
    sseData.value = undefined

    if (!opt.type || !Object.keys(SSE_API).includes(opt.type)) {
      console.error('不存在该类型连接')
      opt.onerror?.(new Error('不存在该类型连接'))
      return
    }
    if (!businessKey.value) {
      console.error('businessKey不存在')
      opt.onerror?.(new Error('businessKey不存在'))
      return ''
    }

    initParam()

    init()

    sseEvent()
  }

  function closeSSE() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }

  function initParam() {
    if (opt.type === SSE_TYPE.NOTICE) {
      const key = getBusinessKey(`SSE-${businessKey.value}`)
      eventSourceUrl = SSE_API[opt.type] + key
    }
    else if (opt.type === SSE_TYPE.PROGRESS) {
      eventSourceUrl = `${SSE_API[opt.type]}?type=${opt.businessType}&businessKey=${businessKey.value}`
    }
  }

  function init() {
    eventSource = new EventSource(eventSourceUrl)
    eventSource.retry = 10000
  }

  function sseEvent() {
    eventSource.onopen = function (event: any) {
      if (opt.onopen)
        opt.onopen(event)
    }

    eventSource.onmessage = function (event: any) {
      const res = JSON.parse(event.data || '{}')
      // 后端查询数据报错时，会返回错误信息，拦截处理
      if (res.code && res.success === false) {
        console.error('sse连接成功，回调参数错误：', res)
        if (opt.onerror)
          opt.onerror(res)
        return
      }
      const data = JSON.parse(event.data)
      sseData.value = data
      if (opt.onmessage) {
        opt.onmessage(data)
      }
    }

    eventSource.onerror = function (error: Error) {
      console.error('EventSource failed:', error)
      console.warn('sse连接失败，自动重新连接')
      if (opt.onerror)
        opt.onerror(error)
    }
  }

  return {
    sseData,
    initSSE,
    closeSSE,
  }
}
