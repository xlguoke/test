// 加载主题
window.setWebTheme = function (theme, beforeTheme) {
  if (theme) {
    const classList = (
      document.getElementsByTagName('body')[0].getAttribute('class') || ''
    ).toString()
    if (beforeTheme) {
      // eslint-disable-next-line no-eval
      const reg = eval(`/${beforeTheme}/g`)
      document
        .getElementsByTagName('body')[0]
        .setAttribute('class', classList.replace(reg, theme))
    }
    else {
      document
        .getElementsByTagName('body')[0]
        .setAttribute('class', `${classList} ${theme}`)
    }
  }

  // 解决页面下再次嵌套iframe的主题设置问题
  if (document.getElementsByTagName('iframe').length > 0) {
    const allPage = document.getElementsByTagName('iframe')
    for (let i = 0; i < allPage.length; i++) {
      allPage[i]
      && allPage[i].contentWindow
      && allPage[i].contentWindow.setWebTheme
      && allPage[i].contentWindow.setWebTheme(theme, beforeTheme)
    }
  }
}

window.onload = function () {
  const theme = localStorage.getItem('webTheme')
  window.setWebTheme(theme)
}
