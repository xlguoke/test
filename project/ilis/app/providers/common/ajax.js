import { Modal } from 'ant-design-vue'
import axios from 'axios'
import { h } from 'vue'
import { useIndustryStore } from '~/store/industryStore'

// 创建axios实例
const ajax = axios.create({
  baseURL: '/ilis2',
  // timeout: 15000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

function handleErrMsg(data) {
  const res = { ...data, message: data?.message || data?.msg || '请求出错' }
  let msgLines = [res.message]
  if (res.message.includes('\n') || res.message.includes('<br')) {
    msgLines = res.message.split(/\n|<br\s*\/?>/i).filter(line => line.trim() !== '')
  }
  Modal.error({
    title: '提示',
    content: h('ul', {}, msgLines.map((line) => { return h('li', {}, line) })),
    centered: true,
    okText: '确认',
  })
}

// request拦截器
ajax.interceptors.request.use((config) => {
  // 在请求发送前动态获取industryId
  const industryId = useIndustryStore().industryId
  if (config.headers['Industry-Id'] === undefined && industryId)
    config.headers['Industry-Id'] = industryId
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
    if (response && response.data && response.data.code === 20050) {
      const originalText = response.data.message || response.data.msg || '请求出错'
      const message = originalText
        .split(/<br\s*\/?>/i)
        .filter(line => line.trim() !== '')
      Modal.warning({
        title: '提示',
        content: h('div', {}, message.map((i) => { return h('div', {}, i) })),
        centered: true,
        okText: '确定',
      })
      response.data.code = 20000
    }
    const res = response.data
    return res
  },
  (error) => {
    const response = error.response
    if (response && response.data && response.data.code == 20010) {
      handleErrMsg(response.data)
    }

    return Promise.reject(error)
  },
)

export default ajax
