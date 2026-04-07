import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import HtIcon from './components/htIcon/HtIcon.vue';
import Antd from "ant-design-vue/es"
import "ant-design-vue/dist/antd.less"
import './assets/style/base.less';
import "./assets/style/mobile.less"
const app = createApp(App)

app.component('ht-icon', HtIcon);
app.use(Antd)
app.use(router);
app.mount('#app')
