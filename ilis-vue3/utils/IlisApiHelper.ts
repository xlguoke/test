import type { AxiosResponse } from 'axios'
import { ILISHTTPError } from '~/types'
import { modalError } from '~/views/unit-config/standard/api'

/** # 请求类型枚举 */
export enum IlisApiType {
  GET = 'get',
  POST = 'post',
  POST_FORM = 'post-form',
  PUT = 'put',
  DELETE = 'delete',
}

/** # api接口配置 */
export interface IlisApiHelperConfig {
  url: string
  params?: Record<string, any>
  config?: Record<string, any>
  type?: IlisApiType
}

/**
 * # api接口辅助类
 * 用于快速创建一个api(默认get请求)
 */
export abstract class IlisApiHelper {
  /**
   * # 创建一个api(默认get请求)
   * @param config
   * @returns IlisAxios请求实例
   */
  private static createApi<T>(config: IlisApiHelperConfig) {
    const safeParams = config.params ?? {}

    const makeRequest = (method?: IlisApiType) => {
      switch (method) {
        case IlisApiType.GET:
          return ilisAxios.get<T>(config.url, { params: safeParams, ...config?.config })
        case IlisApiType.POST:
          return ilisAxios.post<T>(config.url, safeParams, config?.config)
        case IlisApiType.POST_FORM:
          return ilisAxios.postForm<T>(config.url, safeParams, config?.config)
        case IlisApiType.PUT:
          return ilisAxios.put<T>(config.url, safeParams, config?.config)
        case IlisApiType.DELETE:
          return ilisAxios.delete<T>(config.url, { params: safeParams, ...config?.config })
        default:
          return ilisAxios.get<T>(config.url, { params: safeParams, ...config?.config })
      }
    }

    return makeRequest(config.type).catch(this.handleApiError) as Promise<AxiosResponse<T>>
  }

  /**
   * # get请求
   * 传入的参数会被转为url参数
   */
  static get<RES>(url: string, params?: Record<string, any>, config?: Record<string, any>) {
    return this.createApi<RES>({ type: IlisApiType.GET, url, params, config })
  }

  /**
   * # post请求
   * 传入的参数会被转为body参数
   */
  static post<RES>(url: string, params?: Record<string, any>, config?: Record<string, any>) {
    return this.createApi<RES>({ type: IlisApiType.POST, url, params, config })
  }

  /**
   * # post表单请求
   * 传入的参数会被转为form参数
   */
  static postForm<RES>(url: string, params?: Record<string, any>, config?: Record<string, any>) {
    return this.createApi<RES>({ type: IlisApiType.POST_FORM, url, params, config })
  }

  /**
   * # put请求
   * 传入的参数会被转为body参数
   */
  static put<RES>(url: string, params?: Record<string, any>, config?: Record<string, any>) {
    return this.createApi<RES>({ type: IlisApiType.PUT, url, params, config })
  }

  /**
   * # delete请求
   * 传入的参数会被转为body参数
   */
  static delete<RES>(url: string, params?: Record<string, any>, config?: Record<string, any>) {
    return this.createApi<RES>({ type: IlisApiType.DELETE, url, params, config })
  }

  /**
   * # 常规业务错误处理
   * 其余错误在最外层捕获
   * @param err
   */
  static handleApiError(err: unknown) {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  }
}
