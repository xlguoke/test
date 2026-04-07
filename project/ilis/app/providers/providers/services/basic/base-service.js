import { Modal } from 'ant-design-vue'
import ajax from '~/providers/common/ajax'

export class BaseService {
  // 请求
  async Request(opts) {
    const { url, method, data, params, ignoreErrorTip } = opts
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
    }

    if (data && data instanceof FormData) {
      headers['Content-Type']
        = 'application/x-www-form-urlencoded; charset=UTF-8'
    }

    const res = await ajax({
      url,
      method: method || 'GET',
      headers,
      data,
      params,
    })

    if (!ignoreErrorTip && res) {
      if (res.code === 20010 || res.success === false) {
        Modal.warning({
          title: '提示',
          content: res.msg || res.message || '请求出错',
        })
      }
    }

    return res
  }

  // 转换为表单数据
  toFormData(obj) {
    const formData = new FormData()
    for (const key in obj) {
      formData.append(key, obj[key])
    }
    return formData
  }
}
