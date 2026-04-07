/* eslint-disable no-console */
import { Modal } from 'ant-design-vue'
import message from 'ant-design-vue/lib/message/index'
import axios from 'axios'
import { h } from 'vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { useIndustryStore } from '~/store/industryStore'

// 初始化插件
// const resCode = {
//   "20000": "请求成功",
//   "20010": "请求失败",
//   "21000": "新增成功",
//   "22000": "修改成功",
//   "23000": "删除成功"
// };
const SUCCESS_CODE = [20000, 20050, 21000, 22000, 23000]
axios.defaults.baseURL = rootUrl
axios.defaults.timeout = 30000

// request拦截器
axios.interceptors.request.use((config) => {
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

axios.interceptors.response.use(
  (response) => {
    const res = response.data
    // 判断是否登陆信息过期，是则跳转到登陆页
    if (
      typeof res === 'string'
      && res.match(/<!DOCTYPE html>/g)
      && res.match(/loginController\.do\?login/g)
    ) {
      message.error('用户未登录！')
    }
    if (SUCCESS_CODE.includes(res.code) || res.success === true) {
      if (res.code === 20050) {
        const originalText = res.message || res.msg || '请求出错'
        const message = originalText
          .split(/<br\s*\/?>/i)
          .filter(line => line.trim() !== '')
        Modal.warning({
          title: '提示',
          content: h('div', {}, message.map((i) => { return h('div', {}, i) })),
          centered: true,
          okText: '确定',
        })
        res.code = 20000
      }
      return Promise.resolve(res)
    }
    message.error(res.msg || res.message || '请求失败')
    return Promise.resolve('failed')
  },
  (error) => {
    if (error.response && error.response.status == 440) {
      message.error('用户未登录！')
    }
    return Promise.reject(error)
  },
)

export default {
  get(url, throwsException, silent) {
    let hide = null
    if (silent) {
      hide = message.loading('加载中...', 0)
    }
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((res) => {
          setTimeout(hide, 10)
          if (res !== `failed`) {
            if (silent) {
              message.success('加载成功')
            }
            resolve(res)
          }
          if (throwsException) {
            reject(res)
          }
        })
        .catch((err) => {
          setTimeout(hide, 10)
          if (silent) {
            message.error('加载失败')
          }
          console.info(`get 请求失败catch ：`)
          console.info(err)
          if (throwsException) {
            reject(err)
          }
        })
    })
  },
  post(url, params, config, throwsException, silent) {
    let hide
    if (silent) {
      hide = message.loading('数据保存中...', 0)
    }
    return new Promise((resolve, reject) => {
      axios
        .post(url, params, config)
        .then((res) => {
          setTimeout(hide, 10)
          if (res !== `failed`) {
            if (silent) {
              message.success('保存成功')
            }
            resolve(res)
          }
          if (throwsException) {
            reject(res)
          }
        })
        .catch((err) => {
          if (silent) {
            setTimeout(hide, 10)
            message.error('保存失败')
          }
          console.info(`post 请求失败catch ：`)
          console.info(err)
          if (throwsException) {
            reject(err)
          }
        })
    })
  },
  put(url, params, config, throwsException, silent) {
    let hide
    if (silent) {
      hide = message.loading('数据更新中...', 0)
    }
    return new Promise((resolve, reject) => {
      axios
        .put(url, params, config)
        .then((res) => {
          setTimeout(hide, 10)
          if (res !== `failed`) {
            if (silent) {
              message.success('更新成功')
            }
            resolve(res)
          }
          if (throwsException) {
            reject(res)
          }
        })
        .catch((err) => {
          if (silent) {
            setTimeout(hide, 10)
            message.error('更新失败')
          }
          console.info(`put 请求失败catch ：`)
          console.info(err)
          if (throwsException) {
            reject(err)
          }
        })
    })
  },
  delete(url, throwsException, silent) {
    let hide
    if (silent) {
      hide = message.loading('操作进行中...', 0)
    }
    return new Promise((resolve, reject) => {
      axios
        .delete(url)
        .then((res) => {
          setTimeout(hide, 10)
          if (res !== `failed`) {
            if (silent) {
              message.success('操作成功')
            }
            resolve(res)
          }
          if (throwsException) {
            reject(res)
          }
        })
        .catch((err) => {
          if (silent) {
            setTimeout(hide, 10)
            message.error('操作失败', 1000)
          }
          console.info(`delete 请求失败catch ：`)
          console.info(err)
          if (throwsException) {
            reject(err)
          }
        })
    })
  },
}
