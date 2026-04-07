import axios from "axios"
import { message } from "ant-design-vue"
import { getUrlParam } from "../utils/utils"
import { recordRequestStart, recordRequestEnd } from "./requestTimer"

const service = axios.create({
  baseURL:
    import.meta.env.VITE_USER_NODE_ENV == "development" ? "/ilis2" : import.meta.env.VITE_BASE_API,
  timeout: 20000
  // withCredentials: true
})

service.interceptors.request.use(
  function (config) {
    const unitCode = localStorage.getItem("unitCode") || getUrlParam("unitCode") || ""
    config.headers["Unit-Code"] = unitCode

    if (window.authToken) {
      config.headers["Authorization"] = window.authToken
    }

    // 记录请求开始时间
    return recordRequestStart(config)
  },
  function (error) {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  function (response) {
    // 记录请求结束时间并上报
    recordRequestEnd(response)

    const statusValid = [200, 201, 202, 204].includes(response.status)
    if (statusValid) {
      return response.data
    } else {
      message.error(response.data?.msg || "请求异常，请联系管理员")
      return Promise.reject(response.data)
    }
  },
  function (error) {
    console.log("responseError", error)
    // 集中处理网络层异常
    if (!error.response) {
      // 网络层错误处理
      if (error.code === "ERR_NETWORK") {
        message.error("网络异常，请排查网络状况")
      }
      // 超时错误
      else if (error.code === "ECONNABORTED") {
        message.error("请求超时，请稍后再试")
      }
      // 其他未知网络错误
      else {
        message.error("网络连接失败，请检查网络设置")
      }
      return Promise.reject(error)
    }
    const err = error.response?.data
    message.error(err?.msg || "服务异常，请联系管理员")
    return Promise.reject(err)
  }
)

export default service
