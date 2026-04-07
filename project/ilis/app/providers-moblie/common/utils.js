/* eslint-disable eqeqeq */
/* eslint-disable regexp/no-unused-capturing-group */
/* eslint-disable regexp/no-legacy-features */
import ajax from '~/providers-moblie/common/ajax'
import { rootUrl } from '~/providers-moblie/configs/rootUrl'

// 获取指定cookie
function getCookie(NameOfCookie) {
  if (document.cookie.length > 0) {
    let begin = document.cookie.indexOf(`${NameOfCookie}=`)
    if (begin !== -1) {
      begin += NameOfCookie.length + 1
      let end = document.cookie.indexOf(';', begin)
      if (end === -1)
        end = document.cookie.length
      return unescape(document.cookie.substring(begin, end))
    }
  }
  return null
}

/**
 * 时间戳转日期字符串
 * formatTime(1565625600000,YYYY-MM-DD) 2019-08-13
 */
function formatTime(timestamp, fmt) {
  const date = new Date(timestamp)
  const o = {
    'Y+': date.getFullYear(),
    'M+': date.getMonth() + 1, // 月份
    'D+': date.getDate(), // 日
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds(), // 毫秒
  }
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      `${date.getFullYear()}`.substr(4 - RegExp.$1.length),
    )
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length),
      )
    }
  }
  return fmt
}
function ajaxRequest(url, formData, successFunc, succFuncMyParam) {
  ajax({
    method: 'post',
    url,
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
    .then((res) => {
      successFunc(res, succFuncMyParam)
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error, 'error')
    })
}

// 从url获取指定参数
function getQueryVariable(variable) {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] === variable) {
      return decodeURI(pair[1])
    }
  }
  return ''
}

// 提取树中的id，返回一个数组集合
function getTreeAllId(data) {
  if (!Array.isArray(data)) {
    return []
  }
  let arr = []
  // eslint-disable-next-line array-callback-return
  data.map((item) => {
    arr.push(item.id)
    if (item.children && item.children.length != 0) {
      arr = arr.concat(getTreeAllId(item.children))
    }
  })

  return arr
}

function downloadAccessory(accessoryId) {
  window.open(
    `${rootUrl}/uploadController.do?download&accessoryId=${accessoryId}`,
    '_self',
  )
}

export {
  ajaxRequest,
  downloadAccessory,
  formatTime,
  getCookie,
  getQueryVariable,
  getTreeAllId,
}
