import dayjs from 'dayjs'

/** 兼容日期 */
export function compatibleDate(date?: Date | string | number) {
  if (!date) {
    return null
  }

  // 兼容ios
  if (typeof date === 'string') {
    const iDateString = date.replace(/-/g, '/')
    const iDate = new Date(iDateString)

    // 检查日期有效性
    if (Number.isNaN(iDate.getTime())) {
      return null
    }

    return iDate
  }

  return new Date(date)
}

/** 格式化日期 */
export function formatDate(date?: Date | string | number, fmt: 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm:ss' = 'YYYY-MM-DD') {
  const cDate = compatibleDate(date)
  return cDate ? dayjs(cDate).format(fmt) : ''
}
