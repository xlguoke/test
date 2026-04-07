import { message } from 'ant-design-vue'
import axios from 'axios'
import { getQueryVariable } from '~/providers-moblie/common/utils'
import { rootUrl } from '~/providers-moblie/configs/rootUrl'

// 创建axios实例
const ajax = axios.create({
  baseURL: rootUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'clientMark': 'app',
  },
})

// request拦截器
// ajax.interceptors.request.use(config => {
//   config.headers = {
//       "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
//       "X-Requested-With": "XMLHttpRequest"
//   };
//   return config
// });

ajax.interceptors.response.use(
  (response) => {
    const res = response.data

    // 后续要调整登录授权方式，目前暂时通过该方法判断登录过期
    if (
      response.status === 200
      && typeof res === 'string'
      && res.length > 10000
    ) {
      message.error('用户未登录或登录失效！')
      setTimeout(() => {
        const unitCode = getQueryVariable('unitCode')
        const backUrl = encodeURIComponent(window.location.href)

        let href = `${rootUrl}/loginController.do?goAppLogin`
        unitCode && (href += `&curCompany=${unitCode}`)
        href += `&targetUrl=${backUrl}`

        top.window.location.href = href
      }, 1000)
    }

    return res
  },
  (error) => {
    if (error.response && error.response.status === 440) {
      message.error('用户未登录或登录失效！')
      const backUrl = encodeURIComponent(window.location.href)
      top.window.location.href = `${rootUrl}/loginController.do?goAppLogin&targetUrl=${backUrl}`
    }
    else {
      message.error(error.msg || error.message)
    }
    return Promise.reject(error)
  },
)

export default ajax
