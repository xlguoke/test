import { createApp } from "vue"
import App from "./App.vue"
import Antd from "ant-design-vue"
import { createPinia } from "pinia"
import router from "./router"
import "ant-design-vue/dist/antd.less"
import "./assets/style/base.less"

const app = createApp(App)
const pinia = createPinia()

interface pageType {
  skipCount: number
  maxResultCount: number
  total: number
  pageSizes: number[]
  layout: string
}
const pagination: pageType = {
  skipCount: 0,
  maxResultCount: 10,
  total: 0,
  pageSizes: [10, 20, 30, 50, 100],
  layout: "total, prev, pager, next, sizes, jumper"
}

app.config.globalProperties.pagination = pagination

app.use(Antd)
app.use(pinia)
app.use(router)

app.mount("#app")
