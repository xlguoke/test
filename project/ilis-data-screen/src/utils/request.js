import axios from "axios"

const service = axios.create({
  baseURL:
    import.meta.env.VITE_USER_NODE_ENV == "development" ? "/ilis2" : import.meta.env.VITE_BASE_API,
  timeout: 20000
  // withCredentials: true
})

service.interceptors.request.use(
  function (config) {
    const unitCode = localStorage.getItem("unitCode") || ""
    config.headers["Unit-Code"] = unitCode
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
    } else {
      //拦截错误信息 并提示
      // message.error(response.data?.message || "请求异常，请联系管理员")
      return Promise.reject(response.data)
    }
  },
  function (error) {
    console.log(error)
    const err = error.response?.data
    //拦截错误信息 并提示
    // if (error.config.errorMsg) {
    // message.error(err?.message || "服务异常，请联系管理员")
    // }
    return Promise.reject(err)
  }
)

export default service
