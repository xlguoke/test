import { createApp } from "vue"
import App from "./App.vue"
import Antd from "ant-design-vue"
import { createPinia } from "pinia"
import router from "./router"
import "ant-design-vue/dist/antd.less"
import "./assets/style/base.less"

const app = createApp(App)
const pinia = createPinia()

app.use(Antd)
app.use(pinia)
app.use(router)

app.mount("#app")
