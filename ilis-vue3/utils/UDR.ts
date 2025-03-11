import { message } from 'ant-design-vue'

class Base64 {
  // private property
  _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

  // public method for encoding
  encode(input: string) {
    let output = ''
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4
    let i = 0
    input = this._utf8_encode(input)
    while (i < input.length) {
      chr1 = input.charCodeAt(i++)
      chr2 = input.charCodeAt(i++)
      chr3 = input.charCodeAt(i++)
      enc1 = chr1 >> 2
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
      enc4 = chr3 & 63
      if (Number.isNaN(chr2)) {
        enc3 = enc4 = 64
      }
      else if (Number.isNaN(chr3)) {
        enc4 = 64
      }
      output
              = output
              + this._keyStr.charAt(enc1)
              + this._keyStr.charAt(enc2)
              + this._keyStr.charAt(enc3)
              + this._keyStr.charAt(enc4)
    }
    return output
  }

  // public method for decoding
  decode(input: string) {
    let output = ''
    let chr1, chr2, chr3
    let enc1, enc2, enc3, enc4
    let i = 0
    input = input.replace(/[^A-Z0-9+/=]/gi, '')
    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++))
      enc2 = this._keyStr.indexOf(input.charAt(i++))
      enc3 = this._keyStr.indexOf(input.charAt(i++))
      enc4 = this._keyStr.indexOf(input.charAt(i++))
      chr1 = (enc1 << 2) | (enc2 >> 4)
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
      chr3 = ((enc3 & 3) << 6) | enc4
      output = output + String.fromCharCode(chr1)
      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2)
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3)
      }
    }
    output = this._utf8_decode(output)
    return output
  }

  // private method for UTF-8 encoding
  _utf8_encode(string: string) {
    string = string.replace(/\r\n/g, '\n')
    let utftext = ''
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n)
      if (c < 128) {
        utftext += String.fromCharCode(c)
      }
      else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192)
        utftext += String.fromCharCode((c & 63) | 128)
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224)
        utftext += String.fromCharCode(((c >> 6) & 63) | 128)
        utftext += String.fromCharCode((c & 63) | 128)
      }
    }
    return utftext
  }

  // private method for UTF-8 decoding
  _utf8_decode(utftext: string) {
    let string = ''
    let i = 0
    let c = 0
    // let c1 = 0
    let c2 = 0
    let c3 = 0
    while (i < utftext.length) {
      c = utftext.charCodeAt(i)
      if (c < 128) {
        string += String.fromCharCode(c)
        i++
      }
      else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1)
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
        i += 2
      }
      else {
        c2 = utftext.charCodeAt(i + 1)
        c3 = utftext.charCodeAt(i + 2)
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63),
        )
        i += 3
      }
    }
    return string
  }
}
// function Base64() {
//   // private property
//   const _keyStr
//     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

//   // public method for encoding
//   this.encode = function (input) {
//     let output = ''
//     let chr1, chr2, chr3, enc1, enc2, enc3, enc4
//     let i = 0
//     input = _utf8_encode(input)
//     while (i < input.length) {
//       chr1 = input.charCodeAt(i++)
//       chr2 = input.charCodeAt(i++)
//       chr3 = input.charCodeAt(i++)
//       enc1 = chr1 >> 2
//       enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
//       enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
//       enc4 = chr3 & 63
//       if (isNaN(chr2)) {
//         enc3 = enc4 = 64
//       }
//       else if (isNaN(chr3)) {
//         enc4 = 64
//       }
//       output
//         = output
//         + _keyStr.charAt(enc1)
//         + _keyStr.charAt(enc2)
//         + _keyStr.charAt(enc3)
//         + _keyStr.charAt(enc4)
//     }
//     return output
//   }

//   // public method for decoding
//   this.decode = function (input) {
//     let output = ''
//     let chr1, chr2, chr3
//     let enc1, enc2, enc3, enc4
//     let i = 0
//     input = input.replace(/[^A-Z0-9+/=]/gi, '')
//     while (i < input.length) {
//       enc1 = _keyStr.indexOf(input.charAt(i++))
//       enc2 = _keyStr.indexOf(input.charAt(i++))
//       enc3 = _keyStr.indexOf(input.charAt(i++))
//       enc4 = _keyStr.indexOf(input.charAt(i++))
//       chr1 = (enc1 << 2) | (enc2 >> 4)
//       chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
//       chr3 = ((enc3 & 3) << 6) | enc4
//       output = output + String.fromCharCode(chr1)
//       if (enc3 != 64) {
//         output = output + String.fromCharCode(chr2)
//       }
//       if (enc4 != 64) {
//         output = output + String.fromCharCode(chr3)
//       }
//     }
//     output = _utf8_decode(output)
//     return output
//   }

//   // private method for UTF-8 encoding
//   let _utf8_encode = function (string) {
//     string = string.replace(/\r\n/g, '\n')
//     let utftext = ''
//     for (let n = 0; n < string.length; n++) {
//       const c = string.charCodeAt(n)
//       if (c < 128) {
//         utftext += String.fromCharCode(c)
//       }
//       else if (c > 127 && c < 2048) {
//         utftext += String.fromCharCode((c >> 6) | 192)
//         utftext += String.fromCharCode((c & 63) | 128)
//       }
//       else {
//         utftext += String.fromCharCode((c >> 12) | 224)
//         utftext += String.fromCharCode(((c >> 6) & 63) | 128)
//         utftext += String.fromCharCode((c & 63) | 128)
//       }
//     }
//     return utftext
//   }

//   // private method for UTF-8 decoding
//   let _utf8_decode = function (utftext) {
//     let string = ''
//     let i = 0
//     let c = (c1 = c2 = 0)
//     while (i < utftext.length) {
//       c = utftext.charCodeAt(i)
//       if (c < 128) {
//         string += String.fromCharCode(c)
//         i++
//       }
//       else if (c > 191 && c < 224) {
//         c2 = utftext.charCodeAt(i + 1)
//         string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
//         i += 2
//       }
//       else {
//         c2 = utftext.charCodeAt(i + 1)
//         c3 = utftext.charCodeAt(i + 2)
//         string += String.fromCharCode(
//           ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63),
//         )
//         i += 3
//       }
//     }
//     return string
//   }
// }
/**
 * # 将参数放到服务器缓存中
 */
export async function setServerCacheData(query: any) {
  const { data } = await ilisAxios.post<any>('rest/dictionaryController/putDataInServer', query)
  return data
}

/**
 *
 * 获取临时登录令牌
 * @return token
 */
async function getTempLoginToken() {
  const { data } = await ilisAxios.post<any>('loginController.do?getTempToken')
  if (data.success) {
    return data.obj
  }
  else {
    message.error('请求授权失败，请稍后再试')
    return null
  }
}

/**
 * 打开udr
 * @param url 打开udr的地址
 * @param showStyle 打开的方式 hide-隐藏 max-全屏 默认-全屏
 * @param hasToken 是否需要带token
 */
export default async function openHitekUdrTool(url: string, showStyle: string, hasToken: boolean = true) {
  if (hasToken) {
    const token = await getTempLoginToken()
    if (!token) {
      return
    }
    url += `&token=${token}`
  }
  const paramJson = {
    cmd: 'open-url',
    url,
    show: showStyle,
    reuse: false,
  }
  const base64 = new Base64()
  const udrclienthref = `hitek-udr://${base64.encode(JSON.stringify(paramJson))}`
  // const udrclienthref = `hitek-udr://${btoa(JSON.stringify(paramJson))}`
  window.location.href = udrclienthref
}
