import { AxiosError } from 'axios'
import { ZodError } from 'zod'
import { getLogger } from '@ilis/cordova-plugin-log4c'
import { UhbError } from '@/type/errors'

const log = getLogger('uhb.errorTranslator')

export interface ErrorDetail {
  type: 'InternalError' | 'NetworkError' | 'DataIntegrityError' | 'ServerError' | 'UnknownError'
  message: string
  description?: string
  reason?: any
}

export function translateError(err: any): ErrorDetail {
  if (err instanceof UhbError)
    return { type: 'InternalError', message: err.message }
  if (err instanceof AxiosError) {
    // The request was made and the server responded with a status code
    if (err.response) {
      return { type: 'ServerError', message: '请求响应错误', reason: err.response }
    }
    // The request was made but no response was received
    else if (err.request) {
      log.error('the request was made but no response was received. {}', err.request)
      return { type: 'NetworkError', message: '请求发送失败', description: '网络连接错误，请确保网络连接正常后再试', reason: err.request }
    }
    // Something happened in setting up the request that triggered an Error
    log.error('something happened in setting up the request that triggered an Error. {}', err.message)
    return { type: 'UnknownError', message: '未知错误', reason: err }
  }
  if (err instanceof ZodError) {
    log.warn('runtime type safety validation failure. {}', err)
    return { type: 'DataIntegrityError', message: '数据完整性验证错误', reason: err }
  }
  if (err instanceof Error) {
    log.error('unknown error: {}', err)
    return { type: 'UnknownError', message: '未知错误', reason: err }
  }
  log.error('unrecognized error type: {}', err)
  return { type: 'UnknownError', message: '未知错误', reason: err }
}
