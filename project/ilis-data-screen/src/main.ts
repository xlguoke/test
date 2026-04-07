import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./assets/style/base.less"
import "./assets/style/unit-custom-datascreen.less"
import "tailwindcss/index"
import "ant-design-vue/dist/reset.css"
const app = createApp(App)

app.use(router)
app.mount("#app")
