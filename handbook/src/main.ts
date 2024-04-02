import 'ant-design-vue/dist/reset.css'
import { platformId, platformVersion } from 'custodian'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './assets/style/antd-extend.css'
import './assets/style/base.css'
import { createDevice } from './device'
import router from './router'
import TitleBar from '@/layout/components/TitleBar.vue'

const pinia = createPinia()
pinia.use(createPersistedState({ auto: true }))
const device = createDevice()

createApp(App, { ver: platformVersion(), id: platformId() })
  .component('TitleBar', TitleBar)
  .use(pinia)
  .use(router)
  .use(device)
  .mount('#app')
