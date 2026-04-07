import message from 'ant-design-vue/lib/message/index'
import axios from 'axios'
import { rootUrl } from '~/providers/configs/rootUrl'
// const resCode = {
//   "20000": "请求成功",
//   "20010": "请求失败",
//   "21000": "新增成功",
//   "22000": "修改成功",
//   "23000": "删除成功"
// };
// 创建axios实例
const ajax = axios.create({
  baseURL: rootUrl,
  // timeout: 15000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// request拦截器
ajax.interceptors.request.use((config) => {
  // config.headers = {
  //     "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  //     "X-Requested-With": "XMLHttpRequest"
  // };
  if (config && config.headers && config.headers.paramsIsTrim) {
    const params = { ...config.params }
    // eslint-disable-next-line array-callback-return
    Object.keys(params).map((key) => {
      params[key]
      && typeof params[key] == 'string'
      && (params[key] = params[key].trim())
    })
    config.params = params
  }
  return config
})

ajax.interceptors.response.use(
  (response) => {
    // const res = response.data;
    return response
  },
  (error) => {
    if (error.response && error.response.status == 440) {
      message.error('用户未登录！')
    }
    // message.error(error.msg || error.message || "网络异常");
    return Promise.reject(error)
  },
)

export default ajax
