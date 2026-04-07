/**
 * ~/src/utils/api.request.ts
 */
import axios from "axios"
import { message, Modal } from "ant-design-vue"
import { userLocalStorage, clearAllCookie } from "@/assets/js/common"
import userInfoStores from "@/stores/userInfo"

let baseURL = process.env.NODE_ENV == "development" ? "/api" : import.meta.env.VITE_BASE_API

// //因为映射域名 后请求接口 要求取2级，所以这里不能直接通过 VITE_BASE_API  设置前缀，根据当前实际请求url设置前缀
// if(window.location.pathname.indexOf("sygcjc")>-1){
//   baseURL="/sygcjc/api"
// }

axios.defaults.baseURL = baseURL

// axios.defaults.withCredentials = true.
// 接口白名单,在此白名单中接口不会验证token
const whiteUrl = [
  "/login",
  "/username/phone/existence",
  "/portal/password-alter/code",
  "/portal/user-info",
  "/dash/idaas/sso",
  "/dash/report/checkType",
  "/dash/report/find",
  "/dash/report",
  "/s3//reports",
  "/auth/2fa/verify",
  "/auth/2fa/send/code"
]

// 添加请求拦截器
axios.interceptors.request.use(
  function (config: any) {
    config.errorMsg === false ? "" : (config.errorMsg = true) //接口报错，是否显示错误提示  ，默认true

    // 在发送请求之前做些什么
    let token = userLocalStorage.get("userToken")
    //排除登录接口 ，其他接口都需要token验证，否则跳转到登录页
    if (!whitelistsVerify((config as any).url)) {
      if (token) {
        if (config.headers.Authorization !== "none") {
          config.headers.Authorization = "Bearer " + token
        }
      } else {
        const { isJt, jtLoginUrl } = userInfoStores()

        Modal.confirm({
          title: "提示",
          icon: "",
          content: "登录认证失效，是否重新登录！",
          okText: "确认",
          cancelText: "取消",
          onOk() {
            if (isJt) {
              window.location.href = jtLoginUrl
            } else {
              window.location.href = import.meta.env.VITE_BASE_PATH || "/"
            }
          }
        })
      }
    }
    // 处理get中带有特殊符号的请求需要编码处理
    if (config.method === "get" && config.params) {
      let url: any = config.url
      url += url.includes("?") ? "&" : "?"
      const keys = Object.keys(config.params)
      for (const key of keys) {
        url +=
          config.params[key] !== null
            ? `${key}=${encodeURIComponent(config.params[key])}&`
            : `${key}=&`
      }
      url = url.substring(0, url.length - 1)
      config.params = {}
      config.url = url
    }

    // 在发送请求之前做些什么
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
    if (response.status === 204) {
      //更新成功
      return response.data
    } else if (response.status === 201) {
      //创建成功
      return response.data
    } else if (response.status === 200) {
      //请求成功
      return response.data
    } else if (response.status === 202) {
      //请求成功
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
      (error.response.data.type === "CredentialExpiredException" ||
        error.response.data.type === "TwoFactorException")
    ) {
      message.error("登录认证失效,请重新登录")
      setTimeout(() => {
        clearAllCookie()
        userLocalStorage.remove("userToken")
        window.location.href = import.meta.env.VITE_BASE_PATH || "/"
      }, 2000)
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
        if (error.request.responseType === "text") {
          error.response.data = JSON.parse(error.response.data)
        }
        if (error.response.status === 403 && !error.response.data && !error.response.data.message) {
          if (!error.response.data) error.response.data = {}
          error.response.data.message = "您没有访问这个资源的权限"
        }

        //拦截错误信息 并提示
        if (error.config.errorMsg) {
          message.error(error.response.data?.message || "服务异常，请稍后重试！")
        }
      }
    }
    return Promise.reject(error)
  }
)

const whitelistsVerify = (url: String) => {
  let isInclude = false
  whiteUrl.forEach((it) => {
    if (url.includes(it)) {
      isInclude = true
    }
  })
  return isInclude
}

export default axios as any
