import { EDateFormatType } from './EDateFormatType'

/**
 * 时间处理工具类
 */
export class AnyDateTimeHelper {
  /**
   * 格式化时间
   * @param date 时间
   * @param fmt 格式
   * @returns 格式化后的时间
   * @example
   * ```ts
   * AnyDateHelper.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
   * ```
   * @description
   * 支持传入时间戳、Date对象、时间字符串
   */
  static format(date: Date | number | string, fmt: EDateFormatType = EDateFormatType.YYYY_MM_DD_HH_MM_SS): string {
    if (!date) {
      return ''
    }
    let str = fmt.toString()
    if (typeof date === 'number') {
      date = new Date(date)
    }
    else if (typeof date === 'string') {
      // 判断2023-01-01T00:00:00这种类型
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(date)) {
        date = new Date(date)
      }
      else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
        date = new Date(date.replace(/-/g, '/'))
      }
      date = new Date(date)
    }
    const o: Record<string, number | string> = {
      'M+': date.getMonth() + 1, // 月份
      'D+': date.getDate(), // 日
      'H+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
    }
    // eslint-disable-next-line regexp/no-unused-capturing-group
    if (/(Y+)/.test(str)) {
      str = str.replace('YYYY', `${date.getFullYear()}`)
    }
    for (const k in o) {
      const reg = new RegExp(`(${k})`)
      if (reg.test(str)) {
        str = str.replace(reg, k.length === 1 ? o[k].toString() : (`00${o[k]}`).slice(o[k].toString().length))
      }
    }
    return str
  }

  /**
   * 获取时间戳
   * @param date 时间
   * @returns 时间戳
   * @example
   * ```ts
   * AnyDateHelper.getTime(new Date())
   * ```
   * @description
   * 支持传入时间戳、Date对象、时间字符串
   */
  static getTime(date: Date | number | string): number {
    if (typeof date === 'number') {
      return date
    }
    else if (typeof date === 'string') {
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
        return new Date(date.replace(/-/g, '/')).getTime()
      }
      return new Date(date).getTime()
    }
    return date.getTime()
  }

  /**
   * 根据当前时间返回文本 例如：刚刚、1分钟前、1小时前、1天前、1周前、1月前、1年前
   * @param date 时间
   * @returns 文本
   * @example
   * ```ts
   * AnyDateHelper.getTimeText(new Date())
   * ```
   * @description
   * 支持传入时间戳、Date对象、时间字符串
   */
  static getTimeText(date: Date | number | string): string {
    const now = new Date().getTime()
    const time = this.getTime(date)
    const diff = now - time
    const day = diff / (24 * 60 * 60 * 1000)
    const hour = diff / (60 * 60 * 1000)
    const minute = diff / (60 * 1000)
    const second = diff / 1000
    if (day > 365) {
      return `${Math.floor(day / 365)}年前`
    }
    else if (day > 30) {
      return `${Math.floor(day / 30)}月前`
    }
    else if (day > 7) {
      return `${Math.floor(day / 7)}周前`
    }
    else if (day > 1) {
      return `${Math.floor(day)}天前`
    }
    else if (hour > 1) {
      return `${Math.floor(hour)}小时前`
    }
    else if (minute > 1) {
      return `${Math.floor(minute)}分钟前`
    }
    else if (second > 1) {
      return `${Math.floor(second)}秒前`
    }
    else {
      return '刚刚'
    }
  }
}
