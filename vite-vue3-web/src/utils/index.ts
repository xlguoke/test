import axios from "axios"
/**
 *  获取路由参数
 *  @param name 参数名称
 * */
export function getUrlParam(name: string): string {
  if (!name) return ""
  const url = window.location.href
  const par = parseUrl(url)
  return (par as any)[name]
}

/**
 *  格式化路由参数，返回json格式数据
 *  @param url 路由地址
 * */
export function parseUrl(url: string): object {
  const pattern = /(\w+)=([\w%]+)/gi
  const parames: object = {}
  url.replace(pattern, function (a, b, c): any {
    ;(parames as any)[b] = c
  })
  return parames
}

/**
 *  深拷贝
 *  @param obj 数据
 *  @param deep 是否深拷贝,默认为true
 * */
interface kType {
  [key: string]: any
}

export function deepCopy(obj: object, deep = true) {
  const o: kType = obj instanceof Array ? [] : {}
  for (const k in obj) {
    const val = (obj as any)[k]
    o[k] =
      deep && (_typeof(val) === "object" || _typeof(val) === "array") ? deepCopy(val, deep) : val
  }
  return o
}

export function _typeof(data: any): string {
  const val = /\[object (\w+)\]/.exec(Object.prototype.toString.call(data))
  return val ? val[1].toLowerCase + "" : ""
}

/**
 *  函数防抖
 * */
export const debounce = (() => {
  let timer: any = null
  return (func: () => void, wait: number) => {
    timer && clearTimeout(timer)
    timer = setTimeout(func, wait)
  }
})()

/**
 *  函数节流
 * */
export const throttle = (() => {
  let timer: any = null
  return (func: () => void, wait: number) => {
    if (timer) return
    func()
    timer = setTimeout(() => {
      timer = null
    }, wait)
  }
})()

/**
 *  日期格式化
 *  @param  t     需要格式化的时间，不传返回格式化的当前时间
 *  @param  type  时间格式
 *                1(默认)：YYYY-MM-DD
 *                2: YYYY-MM-DD hh:mm:ss
 * */
type tType = Date | string | number

export function formatDate(t: tType, type?: number | undefined): string {
  const date = t ? new Date(t) : new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  let time = `${zero(year)}-${zero(month)}-${zero(day)}`
  if (type === 2) {
    const h = date.getHours()
    const m = date.getMinutes()
    const s = date.getSeconds()
    time += ` ${zero(h)}:${zero(m)}:${zero(s)}`
    return time
  }
  return time
}

function zero(t: string | number) {
  if (!t) return "00"
  return t < 10 ? "0" + t : t
}

/* 下载文件 */
export function downloadFile(blobObj: Blob, fileName: string) {
  const blob = new Blob([blobObj])
  const href = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = href
  a.target = "_blank"
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(href)
  document.body.removeChild(a)
}

export function getBlob(url: string, fileName: string) {
  axios({
    url,
    method: "get",
    responseType: "blob"
  }).then((blob: any) => {
    downloadFile(blob, fileName)
  })
}

// 动态获取图片路径
export const getAssetsFile = (name: string) => {
  return new URL(`../assets/images/${name}`, import.meta.url).href
}

//localStorage 存储
export const userLocalStorage = {
  set(k: string, v: any): void {
    if (v == null || v == "" || v == "undefined") {
      throw new Error("localStorage 未设置值！")
    } else {
      localStorage.setItem(k, v instanceof Object ? JSON.stringify(v) : v)
    }
  },
  get(k: string) {
    try {
      const v = localStorage.getItem(k)
      if (v === null || v === undefined || v === "") {
        return null
      } else {
        try {
          return JSON.parse(v) //如果无法解析就不是json类型 可能是字符串
        } catch (error) {
          return v
        }
      }
    } catch (err) {
      return null
    }
  },
  remove(k: string) {
    localStorage.removeItem(k)
  }
}

//sessionStorage 存储
export const userSessionStorage = {
  set(k: string, v: any): void {
    if (v == null || v == "" || v == "undefined") {
      throw new Error("sessionStorage 未设置值！")
    } else {
      sessionStorage.setItem(k, v instanceof Object ? JSON.stringify(v) : v)
    }
  },
  get(k: string) {
    try {
      const v = sessionStorage.getItem(k)
      if (v === null || v === undefined || v === "") {
        return null
      } else {
        try {
          return JSON.parse(v) //如果无法解析就不是json类型 可能是字符串
        } catch (error) {
          return v
        }
      }
    } catch (err) {
      return null
    }
  },
  remove(k: string) {
    sessionStorage.removeItem(k)
  }
}

//清除所有cookie函数
export function clearAllCookie() {
  const keys = document.cookie.match(/[^ =;]+(?==)/g)
  if (keys) {
    for (let i = keys.length; i--; )
      document.cookie = keys[i] + "=0;expires=" + new Date(0).toUTCString()
  }
}

// 浏览pdf
export const previewPDF = (url: string) => {
  if (!url) {
    console.error("文件地址不存在:", url)
    return
  }
  const page: any = window.open(
    `${window.location.origin}/static/pdfjs-es5/web/viewer.html?file=${url}`,
    "文件预览"
  )
  if (!page) return
  page.onload = () => {
    page.document.title = "文件预览"
  }
}

//前端生成uuid
export const uuid = function () {
  const s: any = []
  const hexDigits = "0123456789abcdef"
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = "4" // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-"

  const uuid = s.join("")
  return uuid
}
