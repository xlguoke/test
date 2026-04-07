
import axios from "axios"
import { message } from "ant-design-vue"



let baseURL=import.meta.env.VITE_USER_NODE_ENV == "development" ? "" : import.meta.env.VITE_BASE_API

// //因为映射域名 后请求接口 要求取2级，所以这里不能直接通过 VITE_BASE_API  设置前缀，根据当前实际请求url设置前缀
// if(window.location.pathname.indexOf("sygcjc")>-1){
//   baseURL="/sygcjc/api"
// }

const service = axios.create({
  baseURL: baseURL,
  timeout: 20000
  // withCredentials: true
})

service.interceptors.request.use(
  function (config) {

    // 处理get params中带有特殊符号的请求需要编码处理
    if (config.method === "get" && config.params) {
      let url = config.url
      url += url.includes('?')?"&":"?"
      const keys = Object.keys(config.params)
      for (const key of keys) {
          url += config.params[key]!==null
          ? `${key}=${encodeURIComponent(config.params[key])}&`
          : `${key}=&`
      }
      url = url.substring(0, url.length - 1)
      config.params = {}
      config.url = url
    }

    config.errorMsg===false?'':config.errorMsg=true  //接口报错，是否显示错误提示  ，默认true
    
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  function (response) {
    const statusValid = [200, 201, 202, 204].includes(response.status)
    if (statusValid) {
      return response.data
    } else if (statusValid && response.data instanceof Blob) {
      if (response.data.type === "application/json") {
        message.error("下载失败")
        return Promise.reject()
      }
      return response.data
    } else {
      //拦截错误信息 并提示
      if(response.config.errorMsg){ 
        message.error(response.data?.message || "请求异常，请联系管理员")
      }
      return Promise.reject(response.data)
    }
  },
  function (error) {
    console.log(error)
    const err = error.response?.data
      //拦截错误信息 并提示
      if(error.config.errorMsg){ 
          message.error(err?.message || "服务异常，请联系管理员")
      }
    return Promise.reject(err)
  }
)

export default service 
