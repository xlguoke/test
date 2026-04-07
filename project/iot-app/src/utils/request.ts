import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { showNotify } from 'vant'
import { STORAGE_TOKEN_KEY, STORAGE_UNITCODE_KEY } from '@/stores/mutation-type'
import { clearToken } from './auth'
import { IError } from './IError'
import { InEmbed } from './referrer'
import { useUserStore } from '@/stores'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 16000, // 请求超时时间
})

export type RequestError = AxiosError<any>

// 异常拦截处理器
function errorHandler(error: RequestError): Promise<any> {
  if (error.response) {
    const err = error.response
    const { status } = error.response
    // 440 无权限
    if (status === 440) {
      showNotify({
        type: 'warning',
        message: '登录信息过期，请重新登录',
      })

      if (InEmbed) {
        if (parent) {
          setTimeout(() => {
            (parent as any).login()
          }, 1000)
        }
      }
      else {
        clearToken()
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }
    if (err && err.data && err.data.success === false && err.data.message) {
      showDialog({ message: err.data.message })
    }
    else if (err?.data?.error?.message) {
      showDialog({ message: err.data.error.message })
    }
  }
  else if (error.message.includes('timeout')) {
    showDialog({ message: '网络超时，请稍后再试' })
  }
  else {
    showDialog({ message: '未知错误，网络异常' })
  }
  return Promise.reject(error)
}

function getHeaderToken() {
  const { token } = useUserStore()
  return token || localStorage.getItem(STORAGE_TOKEN_KEY)
}

function getHeaderUnitCode() {
  const { unitCode } = useUserStore()
  return unitCode || localStorage.getItem(STORAGE_UNITCODE_KEY)
}

// 请求拦截器
function requestHandler(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> {
  const savedToken = getHeaderToken()
  const unitCode = getHeaderUnitCode()
  // 如果 token 存在
  // 让每个请求携带自定义 token, 请根据实际情况修改
  if (savedToken) {
    config.headers.Authorization = savedToken
  }
  if (unitCode) {
    config.headers['Unit-Code'] = unitCode
  }

  return config
}

// Add a request interceptor
request.interceptors.request.use(requestHandler, errorHandler)

// 响应拦截器
function responseHandler(response: { data: any }) {
  const data = response.data

  if (data) {
    if (data.success === false || data.code === 20010) {
      throw new IError({
        message: data.message || data.msg || '操作失败，请稍后再试！',
      })
    }
  }

  return data
}

// Add a response interceptor
request.interceptors.response.use(responseHandler, errorHandler)

export default request
