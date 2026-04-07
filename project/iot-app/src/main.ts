import { createApp } from 'vue'
import { createHead } from '@unhead/vue'
import App from '@/App.vue'
import router from '@/router'
import pinia, { usePermissionStore, useUserStore } from '@/stores'
import 'virtual:uno.css'
import '@/styles/app.less'
import '@/styles/var.less'
import { i18n } from '@/utils/i18n'

// 日历组件
import VueHashCalendar from 'vue3-hash-calendar'
import 'vue3-hash-calendar/es/index.css'

// Vant 桌面端适配
import '@vant/touch-emulator'

/* --------------------------------
Vant 中有个别组件是以函数的形式提供的，
包括 Toast，Dialog，Notify 和 ImagePreview 组件。
在使用函数组件时，unplugin-vue-components
无法自动引入对应的样式，因此需要手动引入样式。
------------------------------------- */
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'
import { FunctionType } from './interface/IPermissionEntity'
import { directivePlugin } from './directives'
import { URLHelper } from './utils/URLHelper'
import type { IsNeedAuth } from './stores/modules/permissionStore'
import { InAndroid, InEmbed } from './utils/referrer'

const app = createApp(App)
const head = createHead()

app.use(directivePlugin)
app.use(head)
app.use(router)
app.use(pinia)
app.use(i18n)
app.use(VueHashCalendar)

const { getPermissionAll, setIsNeedAuth } = usePermissionStore()
const { setToken, initUserInfo, checkLoginStatus } = useUserStore()

const isNeedAuth = URLHelper.getUrlParam('isNeedAuth') as IsNeedAuth
if (isNeedAuth) {
  setIsNeedAuth(isNeedAuth)
}

// 安卓环境下访问需要引入cordova，不然无法调用设备能力
if (InAndroid) {
  useScriptTag('./cordova.js')
}

// 授权登录
const accessToken = URLHelper.getUrlParam('accessToken')
if (accessToken) {
  setToken(accessToken)
  initUserInfo()
}

// 检查登录状态
checkLoginStatus()

if (InEmbed) {
  getPermissionAll(FunctionType.EXECUTE).then(() => {
    app.mount('#app')
  })
}
else {
  app.mount('#app')
}
