import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import Antd from "ant-design-vue"

import "ant-design-vue/dist/reset.css"
import "vant/lib/index.css"
import "./assets/style/base.less"
import "./assets/style/customAntdStyle.less"

import { createPinia } from "pinia"
// pinia数据持久化插件
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(router).use(pinia).use(Antd).mount("#app")
