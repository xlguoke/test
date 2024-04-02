/**
 *  深拷贝
 *  @param obj 数据
 *  @param deep 是否深拷贝,默认为true
 */
interface kType {
  [key: string]: any
}

export function deepCopy(obj: object, deep = true) {
  const o: kType = Array.isArray(obj) ? [] : {}
  for (const k in obj) {
    const val = (obj as any)[k]
    o[k]
      = deep && (_typeof(val) === 'object' || _typeof(val) === 'array')
        ? deepCopy(val, deep)
        : val
  }
  return o
}

export function _typeof(data: any): string {
  const val = /\[object (\w+)\]/.exec(Object.prototype.toString.call(data))
  return val ? `${val[1].toLowerCase}` : ''
}

/**
 *  函数防抖
 */
export const debounce = (() => {
  let timer: any = null
  return (func: () => void, wait: number) => {
    timer && clearTimeout(timer)
    timer = setTimeout(func, wait)
  }
})()

/**
 *  函数节流
 */
export const throttle = (() => {
  let timer: any = null
  return (func: () => void, wait: number) => {
    if (timer)
      return
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
 */
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

function zero(t: number) {
  if (!t)
    return '00'
  return t < 10 ? `0${t}` : t
}

// 动态获取图片路径
export function getAssetsFile(name: string) {
  return new URL(`../assets/images/${name}`, import.meta.url).href
}

// 前端生成uuid
export function uuid() {
  const s: any = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++)
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)

  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  const uuid = s.join('')
  return uuid
}
