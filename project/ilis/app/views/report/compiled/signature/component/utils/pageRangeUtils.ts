/**
 * # 解析页码范围 ⚙️
 * @param rangeStr 用户输入的页码范围字符串
 * @param pageCount 总页数
 * @returns 解析后的页码数组
 */
export function parsePageRange(rangeStr: string, pageCount: number): number[] {
  if (!rangeStr.trim()) {
    return []
  }

  const pages = new Set<number>()
  const parts = rangeStr.split(/[,，\s]+/).filter(part => part.trim())

  for (const part of parts) {
    const trimmed = part.trim()

    // 单个页码：3
    if (/^\d+$/.test(trimmed)) {
      const page = Number.parseInt(trimmed, 10)
      if (page >= 1 && page <= pageCount) {
        pages.add(page)
      }
      continue
    }

    // 页码范围：5-7
    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      const start = Number.parseInt(rangeMatch[1], 10)
      const end = Number.parseInt(rangeMatch[2], 10)
      if (start >= 1 && end <= pageCount && start <= end) {
        for (let i = start; i <= end; i++) {
          pages.add(i)
        }
      }
      continue
    }

    // 从某页开始：5-
    const startOnlyMatch = trimmed.match(/^(\d+)-$/)
    if (startOnlyMatch) {
      const start = Number.parseInt(startOnlyMatch[1], 10)
      if (start >= 1 && start <= pageCount) {
        for (let i = start; i <= pageCount; i++) {
          pages.add(i)
        }
      }
      continue
    }

    // 到某页结束：-7
    const endOnlyMatch = trimmed.match(/^-(\d+)$/)
    if (endOnlyMatch) {
      const end = Number.parseInt(endOnlyMatch[1], 10)
      if (end >= 1) {
        const actualEnd = Math.min(end, pageCount)
        for (let i = 1; i <= actualEnd; i++) {
          pages.add(i)
        }
      }
      continue
    }
  }

  return Array.from(pages).sort((a, b) => a - b)
}

/**
 * # 验证页码范围输入 ⚙️
 * @param rangeStr 用户输入的页码范围字符串
 * @param pageCount 总页数
 * @returns 验证结果
 */
export function validatePageRange(rangeStr: string, pageCount: number): { isValid: boolean, error?: string } {
  if (!rangeStr.trim()) {
    return { isValid: false, error: '请输入页码范围' }
  }

  const parts = rangeStr.split(/[,，\s]+/).filter(part => part.trim())

  for (const part of parts) {
    const trimmed = part.trim()

    // 验证单个数字格式
    // eslint-disable-next-line regexp/no-unused-capturing-group
    if (!/^(\d+|-\d+|\d+-|\d+-\d+)$/.test(trimmed)) {
      return { isValid: false, error: `格式错误："${trimmed}"，请使用数字、范围（如5-7）或起始页（如5-）` }
    }

    // 验证数字范围
    if (trimmed.includes('-')) {
      const rangeParts = trimmed.split('-')

      if (rangeParts.length === 2) {
        const start = rangeParts[0] ? Number.parseInt(rangeParts[0], 10) : 1
        const end = rangeParts[1] ? Number.parseInt(rangeParts[1], 10) : pageCount

        if (rangeParts[0] && (start < 1 || start > pageCount)) {
          return { isValid: false, error: `起始页 ${start} 超出范围（1-${pageCount}）` }
        }

        if (rangeParts[1] && (end < 1 || end > pageCount)) {
          return { isValid: false, error: `结束页 ${end} 超出范围（1-${pageCount}）` }
        }

        if (rangeParts[0] && rangeParts[1] && start > end) {
          return { isValid: false, error: `起始页 ${start} 不能大于结束页 ${end}` }
        }
      }
    }
    else {
      // 验证单个页码
      const page = Number.parseInt(trimmed, 10)
      if (page < 1 || page > pageCount) {
        return { isValid: false, error: `页码 ${page} 超出范围（1-${pageCount}）` }
      }
    }
  }

  return { isValid: true }
}
