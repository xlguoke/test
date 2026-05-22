// 工具函数入口
export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN')
}
