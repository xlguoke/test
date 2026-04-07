import axios from "axios"
import { getUrlParam } from "./utils"
import { useStore } from "@/store"

/**
 * 请求时间记录工具
 * 用于记录请求发起时间和响应接收时间，并上报给后端
 */

// 记录请求时间的接口
interface RequestTimerData {
  requestTime: number // 请求发起时间戳
  receiveRequestTime: number // 服务端收到请求时间
  responseTime: number // 服务端响应时间
  receiveResponseTime: number // 客户端收到请求的时间
  url: string // 请求URL
  client: string
}

/**
 * 记录请求开始时间
 * @param config - axios请求配置
 * @returns 包含请求开始时间的配置对象
 */
export function recordRequestStart(config: any): any {
  // 创建一个新的配置对象，避免直接修改原始配置
  const newConfig = { ...config }
  // 记录请求开始时间
  newConfig.__requestStartTime = Date.now()
  return newConfig
}

/**
 * 记录请求结束时间并上报
 * @param response - axios响应对象
 * @returns 原始响应对象
 */
export function recordRequestEnd(response: any): any {
  // 获取请求开始时间
  const requestStartTime = response.config.__requestStartTime
  if (requestStartTime) {
    // 计算请求耗时
    const requestEndTime = Date.now()

    const client = getClient()

    // 准备上报数据
    const timerData: RequestTimerData = {
      url: response.config.url,
      requestTime: requestStartTime,
      receiveRequestTime: response?.data?.receiveRequestTime,
      responseTime: response?.data?.responseTime,
      receiveResponseTime: requestEndTime,
      client
    }
    // 上报请求时间记录到后端
    reportRequestTime(timerData)
  }
  return response
}

/**
 * 上报请求时间记录到后端
 * @param timerData - 请求时间数据
 */
async function reportRequestTime(timerData: RequestTimerData): Promise<void> {
  try {
    const unitCode = localStorage.getItem("unitCode") || getUrlParam("unitCode") || ""
    // 创建一个独立的axios实例用于上报，避免与主请求拦截器冲突
    const reportInstance = axios.create({
      timeout: 5000 // 上报接口设置较短的超时时间
    })
    reportInstance.defaults.headers["Unit-Code"] = unitCode
    reportInstance.defaults.headers["Authorization"] = (window as any).authToken
    // 发送上报请求，使用POST方法
    await reportInstance.get("/ilis2/rest/api/timer/record", {
      params: timerData
    })
  } catch (error) {
    // 上报失败不影响主流程，仅在控制台记录错误
    console.error("请求时间记录上报失败:", error)
  }
}

function getClient() {
  const { screenConfig } = useStore()
  // 获取客户端信息
  const client = screenConfig?.sn || location.href
  return client
}
