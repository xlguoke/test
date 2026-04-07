import { createApp } from "vue"
import App from "./App.vue"
import { createPinia, storeToRefs } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import router from "./router"
import HandleBtns from "./components/handleBtns/index.vue"
import existingTag from "./stores/existingTag"

import "ant-design-vue/es/message/style"
import "./assets/style/base.less"

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) //pinia 注册数据持久化插件

// app.use(Antd)
app.use(router)
app.use(pinia)

app.component("HandleBtns", HandleBtns)

// pinia挂载后再调用
const { currentView } = storeToRefs(existingTag())
app.directive("auth", (el, binding) => {
  const auths = (currentView.value as any).auths
  if (auths.length === 0) {
    el.remove()
  } else {
    const code = binding.value
    const isAuth = auths.find((d) => d.code == code)
    if (!isAuth) {
      el.remove()
    }
  }
})

app.mount("#app")
