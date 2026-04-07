/** 对比两个数据是否相等，考虑类型转换 */
export function isEqual(a?: string | number | null, b?: string | number | null): boolean {
  // 处理参数不存在的情况（undefined 或 null）
  if (a === undefined || a === null) {
    return b === undefined || b === null
  }
  if (b === undefined || b === null) {
    return false
  }

  // 都转为字符串比较
  return String(a) === String(b)
}
