import type { UseFetchOptions, UseFetchReturn } from '@vueuse/core'
import type { MaybeRefOrGetter } from '@vueuse/shared'
import { createFetch } from '@vueuse/core'
import { Modal } from 'ant-design-vue'
import permissionStore from '@/stores/permissions'

interface Params {
  [key: string]: any
}

type MyRequestInit = RequestInit & {
  params?: Params
}

let modal: any = null

// 初始化url：拼接get请求参数
function initUrlSearchParams(url: string, params?: Params): string {
  if (!params || JSON.stringify(params) === '{}')
    return url
  for (const k in params) {
    if (params[k] === undefined || params[k] === null)
      delete params[k]
  }
  return `${url}${!url.includes('?') ? '?' : '&'}${new URLSearchParams(params)}`
}

const myFetch = createFetch({
  baseUrl: import.meta.env.VITE_BASE_API,
  options: {
    beforeFetch({ url, options }) {
      const token = permissionStore().Authorization || ''
      const _options: MyRequestInit = {
        ...options,
        headers: {
          'Authorization': `${token ? `Bearer ${token}` : ''}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }

      if (!options.method || options.method?.toLocaleLowerCase() === 'get') {
        url = initUrlSearchParams(url, _options.params)
      }
      return { url, options: _options }
    },
    afterFetch(ctx) {
      const { status } = ctx.response

      // eslint-disable-next-line no-console
      console.info('request: ', ctx)
      if (/^2\d{2}$/.test(`${status}`)) {
        return ctx
      }
      return Promise.reject(ctx.data)
    },
    onFetchError(ctx) {
      console.error('error: ', ctx)

      if (ctx.data && typeof ctx.data === 'string') {
        ctx.data = JSON.parse(ctx.data)
      }

      if (ctx.response && /^2\d{2}$/.test(`${ctx.response.status}`)) {
        return Promise.resolve(ctx.data)
      }

      if (modal)
        modal.destroy()

      let msg = ctx?.data?.message || ctx.error.message
      if (!msg || msg === 'Internal Server Error' || msg === 'Unexpected end of JSON input')
        msg = '系统异常，请稍后重试或联系系统管理员！'
      else if (msg === 'Failed to fetch')
        msg = '网络异常，请稍后重试！'

      modal = Modal.error({
        title: '提示',
        content: msg,
        centered: true,
        okText: '确定',
      })

      return ctx
    },
  },
})

function useMyFetch<T>(
  url: MaybeRefOrGetter<string>,
  options?: MyRequestInit,
  useFetchOptions?: UseFetchOptions,
): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>> {
  return myFetch(url, options || {}, useFetchOptions).json()
}

export default useMyFetch
