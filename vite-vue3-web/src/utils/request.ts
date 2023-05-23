/**
 * ~/src/utils/api.request.ts
 */
import axios from "axios"
import { message } from "ant-design-vue"
import { getToken } from "./auth"

const isDev = import.meta.env.VITE_NODE_ENV == "development"
const baseURL = import.meta.env.VITE_BASE_API

axios.defaults.baseURL = baseURL
// axios.defaults.withCredentials = true.
// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    if (getToken()) {
      config.headers.Authorization = "Bearer " + getToken()
    }
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    if (response.status === 200) {
      return response.data
    } else {
      message.error(response.data?.message || "请求错误！")
      return Promise.reject(response.data)
    }
  },
  function (error) {
    console.log("error:", error)
    // 对响应错误做点什么
    if (
      error.response.status === 401 &&
      error.response.data.type === "CredentialsExpiredException"
    ) {
      message.error("登录认证失效,请重新登录")
    } else {
      // responseType为blob的请求失败后的返回值处理
      if (error.request.responseType === "blob") {
        let typeCount = {
          type: "application/octet-stream"
        }
        let blob = new Blob([error.response.data], typeCount)
        const fileReader = new FileReader()
        fileReader.readAsText(blob, "utf-8")
        fileReader.onload = function () {
          let msg = JSON.parse(fileReader.result as string).message
          return message.error(msg || "获取文件失败")
        }
      } else {
        message.error(error.response.data?.message || "服务异常，请稍后重试！")
      }
    }
    return Promise.reject(error)
  }
)

export default axios
