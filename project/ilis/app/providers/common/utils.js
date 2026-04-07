/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import ajax from '~/providers/common/ajax'
import { rootUrl } from '~/providers/configs/rootUrl'

// 获取指定cookie
function getCookie(NameOfCookie) {
  if (document.cookie.length > 0) {
    var begin = document.cookie.indexOf(NameOfCookie + '=')
    if (begin !== -1) {
      begin += NameOfCookie.length + 1
      var end = document.cookie.indexOf(';', begin)
      if (end === -1) end = document.cookie.length
      return unescape(document.cookie.substring(begin, end))
    }
  }
  return null
}

/**
 * 时间戳转日期字符串
 * formatTime(1565625600000,YYYY-MM-DD) 2019-08-13
 */
function formatTime(timestamp = '', fmt) {
  let date = new Date(timestamp)
  if (
    timestamp &&
    timestamp.indexOf &&
    timestamp.indexOf('T16:00:00.000Z') !== -1
  ) {
    timestamp = timestamp.substring(0, 10)
    date = new Date(timestamp)
    date.setDate(date.getDate() + 1)
  }

  const o = {
    'Y+': date.getFullYear(),
    'M+': date.getMonth() + 1, // 月份
    'D+': date.getDate(), // 日
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  }
  if (/(Y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      `${date.getFullYear()}`.substr(4 - RegExp.$1.length)
    )
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
      )
  }

  return fmt
}

function ajaxRequest(url, formData, successFunc, succFuncMyParam) {
  ajax({
    method: 'post',
    url: url,
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
    .then((res) => {
      successFunc(res, succFuncMyParam)
    })
    .catch((error) => console.log(error, 'error'))
}

// 从url获取指定参数
function getQueryVariable(variable) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (pair[0] === variable) {
      return decodeURI(pair[1]) 
    }
  }
  return ''
}

// 定义方法用于解决udr字符串中的转义情况
function replaceUdrChar(str) {
  var string = str || ''
  //字符串按“\n分割成数组”
  var arr = string.split('\\n')
  for (var i = 0; i < arr.length; i++) {
    //包含下标“\d”的情况字符串处理
    if (arr[i].includes('\\d')) {
      arr[i] =
        arr[i].slice(0, arr[i].indexOf('\\d')) +
        '<sub>' +
        arr[i].slice(arr[i].indexOf('\\d'), arr[i].length) +
        '</sub>'
      arr[i] = arr[i].replace(/\\d/g, '')
      //包含上标“\u”的情况字符串处理
    } else if (arr[i].includes('\\u')) {
      arr[i] =
        arr[i].slice(0, arr[i].indexOf('\\u')) +
        '<sup>' +
        arr[i].slice(arr[i].indexOf('\\u'), arr[i].length) +
        '</sup>'
      arr[i] = arr[i].replace(/\\u/g, '')
    }
  }
  //重新转换成字符串并去除拼接逗号
  return arr.toString().replace(/,/g, '')
}

// 提取树中的id，返回一个数组集合
function getTreeAllId(data) {
  if (!Array.isArray(data)) {
    return []
  }
  let arr = []
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
    `${rootUrl}/uploadController.do?download&accessoryId=` + accessoryId,
    '_self'
  )
}

function Base64() {
  // private property
  let _keyStr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

  // public method for encoding
  this.encode = function (input) {
    var output = ''
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4
    var i = 0
    input = _utf8_encode(input)
    while (i < input.length) {
      chr1 = input.charCodeAt(i++)
      chr2 = input.charCodeAt(i++)
      chr3 = input.charCodeAt(i++)
      enc1 = chr1 >> 2
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
      enc4 = chr3 & 63
      if (isNaN(chr2)) {
        enc3 = enc4 = 64
      } else if (isNaN(chr3)) {
        enc4 = 64
      }
      output =
        output +
        _keyStr.charAt(enc1) +
        _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) +
        _keyStr.charAt(enc4)
    }
    return output
  }

  // public method for decoding
  this.decode = function (input) {
    var output = ''
    var chr1, chr2, chr3
    var enc1, enc2, enc3, enc4
    var i = 0
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++))
      enc2 = _keyStr.indexOf(input.charAt(i++))
      enc3 = _keyStr.indexOf(input.charAt(i++))
      enc4 = _keyStr.indexOf(input.charAt(i++))
      chr1 = (enc1 << 2) | (enc2 >> 4)
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
      chr3 = ((enc3 & 3) << 6) | enc4
      output = output + String.fromCharCode(chr1)
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2)
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3)
      }
    }
    output = _utf8_decode(output)
    return output
  }

  // private method for UTF-8 encoding
  let _utf8_encode = function (string) {
    string = string.replace(/\r\n/g, '\n')
    var utftext = ''
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n)
      if (c < 128) {
        utftext += String.fromCharCode(c)
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192)
        utftext += String.fromCharCode((c & 63) | 128)
      } else {
        utftext += String.fromCharCode((c >> 12) | 224)
        utftext += String.fromCharCode(((c >> 6) & 63) | 128)
        utftext += String.fromCharCode((c & 63) | 128)
      }
    }
    return utftext
  }

  // private method for UTF-8 decoding
  let _utf8_decode = function (utftext) {
    var string = ''
    var i = 0
    var c = 0
    var c1 = 0
    var c2 = 0
    var c3 = 0
    while (i < utftext.length) {
      c = utftext.charCodeAt(i)
      if (c < 128) {
        string += String.fromCharCode(c)
        i++
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1)
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
        i += 2
      } else {
        c2 = utftext.charCodeAt(i + 1)
        c3 = utftext.charCodeAt(i + 2)
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        )
        i += 3
      }
    }
    return string
  }
}

/**
 * 生成一个id
 * @return uuid
 * */
function getUUID() {
  var s = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  var uuid = s.join('')
  return uuid
}

// 事件防抖
const debounce = (() => {
  let timer = null
  return (func, wait) => {
    timer && clearTimeout(timer)
    timer = setTimeout(func, wait)
  }
})()

/* 下载文件 */
export function downloadFile(href, fileName = '') {
  const a = document.createElement('a')
  a.href = href
  a.target = '_blank'
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(href)
  document.body.removeChild(a)
}

export {
  getCookie,
  formatTime,
  ajaxRequest,
  getQueryVariable,
  getTreeAllId,
  downloadAccessory,
  Base64,
  replaceUdrChar,
  getUUID,
  debounce,
}
