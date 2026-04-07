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
export function deepCopy(obj: object, deep = true) {
  const o: any = obj instanceof Array ? [] : {}
  for (const k in obj) {
    const val = (obj as any)[k]
    o[k] =
      deep && (_typeof(val) === "object" || _typeof(val) === "array") ? deepCopy(val, deep) : val
  }
  return o
}

export function _typeof(data: any): string {
  let val = /\[object (\w+)\]/.exec(Object.prototype.toString.call(data))
  return val ? val[1].toLowerCase() + "" : ""
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
 *                3: hh:mm:ss
 * */
type tType = Date | string | number

export function formatDate(t: tType, type?: number | string): string {
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
  } else if (type === 3) {
    const h = date.getHours()
    const m = date.getMinutes()
    const s = date.getSeconds()
    time = `${zero(h)}:${zero(m)}:${zero(s)}`
  }
  return time
}

export function zero(t: string | number) {
  if (!t) return "00"
  return t < 10 ? "0" + t : t
}

/* 下载文件 */
export function downloadFile(blobObj: Blob, fileName: string) {
  const blob = new Blob([blobObj])
  const href = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = href
  a.download = fileName
  document.body.appendChild(a)
  a.click()
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
export const getAssetsFile = (name: string): string => {
  return new URL(`../images/${name}`, import.meta.url).href
}

//localStorage 存储
export const userLocalStorage = {
  set(k: string, v: any): void {
    if (v == null || v == "" || v == "undefined") {
      throw new Error("localStorage 未设置值！")
    } else {
      localStorage.setItem(k, JSON.stringify(v))
    }
  },
  get(k: string) {
    try {
      const v = localStorage.getItem(k)
      if (v === null || v === undefined || v === "") {
        return null
      } else {
        return JSON.parse(v)
      }
    } catch (err) {
      return null
    }
  },
  remove(k: string) {
    localStorage.removeItem(k)
  }
}

// 浏览pdf
export const previewPDF = (url: string) => {
  let page: any = window.open(`static/pdfjs-es5/web/viewer.html?file=${url}`, "文件预览")
  page.onload = () => {
    page.document.title = "文件预览"
  }
}

//前端生成uuid
export const uuid = function () {
  let s: any = []
  let hexDigits = "0123456789abcdef"
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = "4" // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-"

  let uuid = s.join("")
  return uuid
}

export const createRandomNum = (len = 16) => {
  const t = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjkzxcvbnm234567890"
  let val = ""
  for (let i = 0; i < len; i++) {
    val += t.charAt(Math.floor(Math.random() * t.length))
  }
  return val
}

export const clacChartPx = (val: number) => {
  const ele = document.querySelector("html")

  if (ele) {
    const fontSize = parseFloat(ele.style.fontSize)
    return (fontSize / 100) * val
  }

  return val
}
