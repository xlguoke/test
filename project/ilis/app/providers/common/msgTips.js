export function info(msg, options) {
  const doptions = {
    title: '提示',
    content: msg,
    okText: '确认',
    centered: true,
  }
  return { ...doptions, ...options }
}
