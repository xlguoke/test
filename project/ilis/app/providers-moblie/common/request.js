import { message } from 'ant-design-vue'
import axios from 'axios'
import { rootUrl } from '~/providers-moblie/configs/rootUrl'

const resCode = {
  20000: '请求成功',
  20010: '请求失败',
  21000: '新增成功',
  22000: '修改成功',
  23000: '删除成功',
}

const service = axios.create({
  baseURL: rootUrl,
  timeout: 10000,
})

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 20010) {
      message.error(res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    }
    else {
      res.message = resCode[res.code]
      return res
    }
  },
  (error) => {
    message.error(error.message)
    return Promise.reject(error)
  },
)

export default service
