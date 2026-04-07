import { Modal } from 'ant-design-vue'
import message from 'ant-design-vue/lib/message/index'
import axios from 'axios'
import { h } from 'vue'
import { useIndustryStore } from '~/store/industryStore'

const resCode = {
  20000: '请求成功',
  20010: '请求失败',
  21000: '新增成功',
  22000: '修改成功',
  23000: '删除成功',
}

const service = axios.create({
  baseURL: '/ilis2',
  timeout: 10000 * 7,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
  },
})
// request拦截器
service.interceptors.request.use((config) => {
  // 在请求发送前动态获取industryId
  const industryId = useIndustryStore().industryId
  if (config.headers['Industry-Id'] === undefined && industryId)
    config.headers['Industry-Id'] = industryId
  return config
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
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (
      typeof res === 'string'
      && res.match(/<!DOCTYPE html>/g)
      && res.match(/loginController\.do\?login/g)
    ) {
      message.error('用户未登录！')
    }

    if (res.code === 20010) {
      handleErrMsg(res)
      return Promise.reject(new Error(res.message || 'Error'))
    }
    else {
      if (res.code === 20050) {
        handleErrMsg(res)
        res.code = 20000
        return res
      }
      res.message = resCode[res.code]
      return res
    }
  },
  (error) => {
    if (error.response && error.response.status == 440) {
      message.error('用户未登录！')
    }
    else {
      message.error(error.message)
    }
    return Promise.reject(error)
  },
)

export default service
