export function base64ToFile(dataurl: string, filename = '') {
  if (!dataurl.includes('base64,')) {
    throw new Error('Invalid base64 data')
  }
  const arr: any = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  if (!filename) {
    const fix = mime.split('/')[1] || 'png'
    filename = `${Date.now()}.${fix}`
  }
  return new File([u8arr], filename, { type: mime })
}
