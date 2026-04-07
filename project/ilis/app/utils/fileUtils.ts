export function isImage(format: string): boolean {
  const lowerFormat = format.toLowerCase()
  const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff']
  return imageFormats.includes(lowerFormat)
}

export function isExcel(format: string): boolean {
  const lowerFormat = format.toLowerCase()
  const excelFormats = ['xls', 'xlsx', 'xlsm', 'xlsb', 'csv']
  return excelFormats.includes(lowerFormat)
}

export function isWord(format: string): boolean {
  const lowerFormat = format.toLowerCase()
  const wordFormats = ['doc', 'docx', 'docm', 'dot', 'dotx', 'rtf']
  return wordFormats.includes(lowerFormat)
}

export function isPdf(format: string): boolean {
  const lowerFormat = format.toLowerCase()
  return lowerFormat === 'pdf'
}

const imgIcon = new URL('~/assets/img/img.svg', import.meta.url).href
const excelIcon = new URL('~/assets/img/excel.svg', import.meta.url).href
const wordIcon = new URL('~/assets/img/word.svg', import.meta.url).href
const pdfIcon = new URL('~/assets/img/pdf.svg', import.meta.url).href
const otherFile = new URL('~/assets/img/otherFile.svg', import.meta.url).href

/** # 根据文件后缀获取对应图标 ⚙️ */
export function getIcon(format: string): string {
  // 统一转换为小写进行比较
  const lowerFormat = format.toLowerCase()

  // 图片类型
  if (isImage(lowerFormat)) {
    return imgIcon
  }

  // Excel类型
  if (isExcel(lowerFormat)) {
    return excelIcon
  }

  // Word类型
  if (isWord(lowerFormat)) {
    return wordIcon
  }

  // PDF类型
  if (isPdf(lowerFormat)) {
    return pdfIcon
  }

  // 其他类型默认返回其他文件图标
  return otherFile
}
