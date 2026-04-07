// 递归向上获取
export function getConsignWindow(w: any) {
  const _window = w || window

  if (_window.consignWindow) {
    return _window.consignWindow
  }

  try {
    if (_window.parent !== _window) {
      return getConsignWindow(_window.parent)
    }
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    return _window.consignWindow
  }

  return _window.consignWindow
}
