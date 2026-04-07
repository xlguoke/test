import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetMini,
  presetUno,
} from 'unocss'

import presetRemToPx from '@unocss/preset-rem-to-px'

// 刚使用unocss的朋友，可以借助这个工具： https://to-unocss.netlify.app

export default defineConfig({
  presets: [
    presetUno,
    presetAttributify,
    presetIcons(),
    // 为什么要用到这个插件？
    // 模板使用 viewport 作为移动端适配方案，unocss 默认单位为 rem
    // 所以需要转成 px，然后由 postcss 把 px 转成 vw/vh，完成适配
    presetRemToPx({
      // 这里为什么要设置基础字体大小？看下面这篇文章
      // https://juejin.cn/post/7262975395620618298
      baseFontSize: 4,
    }),
    presetMini(),
  ],
  shortcuts: [
    // shortcuts to multiple utilities
    ['btn', 'h32 min-w-64'],
    ['fixed-box', 'fixed bottom-0 left-0 right-0 z-10 bg-wrapper p12'],
    ['fixed-box-pop', 'pos-absolute bottom-0 left-0 right-0 z-10 fixed-box-pop-bg p12'],
    ['title', 'text-16 font-700 ellipsis flex-1 w-full'],
    ['flex-x', 'flex items-center'],
    ['flex-y', 'flex flex-col justify-center items-center'],
    ['dot', 'inline-block w-6 h-6 bg-green-400 rounded-full mr-4'],
    ['card', '  card-boder card-content-bg rounded-8 p-12 text-12'],
    ['label', ' text-#5B7489 whitespace-nowrap'],
    ['stripe', ' mr-8 inline-block h-16 w-6 rounded-6 bg-primary'],
  ],
  rules: [
    ['ellipsis', { 'white-space': 'nowrap', 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'word-break': 'break-all' }],
    ['shadow', { 'box-shadow': '0px 0px 20px 0px rgba(0, 102, 236, 0.08)' }],
    ['card-boder', { border: '1px solid #FFFFFF' }],
    ['card-content-bg', { background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%)' }],
    ['fixed-box-pop-bg', { background: 'linear-gradient(180deg, #aeb9c3, #8496a5)' }],
    ['split-boder', { 'border-bottom': '1px solid #dbe6f0' }],
  ],
  theme: {
    // ...
    colors: {
      primary: '#0066EC', // class="text-primary"
      danger: '#FF6666',
      wrapper: '#dae7f5',
      text: '#224059',
    },
  },
})
