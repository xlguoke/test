import type { AxiosResponseHeaders } from 'axios'
import { ILISHTTPError } from '~/types'

/**
 * ilis2 axios instance with env configured base url
 *
 * You should always use a relative url path in requests
 *
 * This instance has been configured with response transformer you should only deal with normalized data
 */
export const ilisAxios = axios.create({
  baseURL: import.meta.env.VITE_ILIS_BASE,
  transformResponse: [...shallowCopyAxiosDefaultResponseTransformer(), MalformedResponseTransformer],
})

function MalformedResponseTransformer(data: any, headers: AxiosResponseHeaders) {
  if (!headers.hasContentType('application/json'))
    return data
  if (typeof data !== 'object')
    return data
  // for RestResponse
  if (data.code === 20000 && 'data' in data) {
    return data.data
  }
  else if (data.code === 20010 && 'message' in data) {
    throw new ILISHTTPError(data.message, data.code)
  }
  // for ancient AjaxJson response
  if ('success' in data && 'msg' in data && 'obj' in data) {
    if (data.success === true) {
      return data
    }
    else {
      throw new ILISHTTPError(data.msg, data.code)
    }
  }
  return data
}

function shallowCopyAxiosDefaultResponseTransformer() {
  if (Array.isArray(axios.defaults.transformResponse))
    return [...axios.defaults.transformResponse]
  if (typeof axios.defaults.transformResponse === 'function')
    return [axios.defaults.transformResponse]
  return []
}
