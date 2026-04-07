import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { showNotify } from 'vant'
import { setSessionExpiresTime } from '~/views/mobileApp/libs/session'
import { useAppIndustryStore } from '~/views/mobileApp/store/useAppIndustryStore.ts'

/**
 * API响应结构
 * 拦截器会将后端返回的数据包装成此结构
 */
interface ApiResponse<T = any> {
  /** 响应码 */
  code: number
  /** 是否成功 */
  succeed: boolean
  /** 响应消息 */
  message?: string
  /** 响应数据 */
  data: T
  /** 响应数据 */
  rows?: T[]
  /** 响应数据总数 */
  count?: number
}

// 创建axios实例
const mRequest = axios.create({
  baseURL: '/ilis2',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// request拦截器
mRequest.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('userTokenAuth')
    const industryId = useAppIndustryStore().industryId

    if (!config.headers['Industry-Id'] && industryId) {
      config.headers['Industry-Id'] = industryId
    }

    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    console.warn(error)
    Promise.reject(error)
  },
)

mRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    setSessionExpiresTime()
    const res = response.data

    // 判断是否 登录信息过期，是则跳转到 登录页
    if (
      typeof res === 'string'
      && res.match(/<!DOCTYPE html>/g)
      && res.match(/loginController\.do\?checkuser/g)
    ) {
      // localStorage.removeItem("userInfo");
      // showNotify({ type: 'warning', message: '用户未登录' })
      // window.location.href = "#/login";
    }

    return res
  },
  (error) => {
    const err = error.response
    if (err?.status === 440) {
      localStorage.removeItem('userInfo')
      showNotify({ type: 'warning', message: '登录信息过期，请重新登录' })
      setTimeout(() => window.location.reload(), 1000)
      return
    }

    if (err?.data?.success === false && err?.data?.message) {
      showDialog({ message: err.data.message })
    }
    else if (err?.data?.error?.message) {
      showDialog({ message: err.data.error.message })
    }
    else {
      showDialog({ message: '未知错误，网络异常' })
    }
    return Promise.reject(error.response)
  },
)

// 包装mRequest，确保返回正确的类型
interface MRequest {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
}

/**
 * 处理ts类型，调用方式只能是 request[get/post/put/delete]<T>(url, config)
 * 直接调用使用 mRequest()
 */
const request: MRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    mRequest.get(url, config) as Promise<ApiResponse<T>>,
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    mRequest.post(url, data, config) as Promise<ApiResponse<T>>,
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    mRequest.put(url, data, config) as Promise<ApiResponse<T>>,
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    mRequest.delete(url, config) as Promise<ApiResponse<T>>,
}

export { mRequest, request }
