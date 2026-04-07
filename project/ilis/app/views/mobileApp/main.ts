import { InMiniProgram } from './provides/utils/referrer'

import 'vant/lib/index.css'
// import 'vant/es/toast/style'
// import 'vant/es/dialog/style'
// import 'vant/es/notify/style'
// import 'vant/es/image-preview/style'

// 引入全局样式
import '~/views/mobileApp/mobile-app.less'
import '~/views/mobileApp/provides/date-extend'

// 引入iconfont
import '~/views/mobileApp/assets/iconfont/iconfont.css'

const woff2 = new URL('~/views/mobileApp/assets/iconfont/iconfont.woff2', import.meta.url).href
const woff = new URL('~/views/mobileApp/assets/iconfont/iconfont.woff', import.meta.url).href
const ttf = new URL('~/views/mobileApp/assets/iconfont/iconfont.ttf', import.meta.url).href

window.onload = function () {
  // 动态创建 @font-face 规则
  const fontFaceRule = `
  @font-face {
    font-family: "iconfont";
    src: url(${woff2}) format('woff2'),
         url(${woff}) format('woff'),
         url(${ttf}) format('truetype');
    font-display: swap;
  }
`
  // 创建 style 元素并插入到文档中
  const style = document.createElement('style')
  style.textContent = fontFaceRule
  document.head.appendChild(style)
}

// 嵌入微信小程序时，不显示标题
if (InMiniProgram) {
  document.title = '  '
}
