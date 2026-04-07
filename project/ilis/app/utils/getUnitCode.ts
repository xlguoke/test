export function getUnitCode(): string {
  return localStorage.getItem('unitCode') || ''
}
