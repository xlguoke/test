import { platformId, platformVersion } from 'custodian'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { ConfigProvider } from 'vant'
import App from './App.vue'
import './assets/style/base.css'
import { createDevice } from './device'
import router from './router'
import { useReportErrorStore } from './stores/reportError'
import TitleBar from '@/layout/components/TitleBar.vue'
import '@/assets/style/vant-extend.less'

const pinia = createPinia()
pinia.use(createPersistedState({ auto: true }))
const device = createDevice()

export const app = createApp(App, { ver: platformVersion(), id: platformId() })
  .component('TitleBar', TitleBar)
  .use(pinia)
  .use(router)
  .use(device)
  .use(ConfigProvider)

app.mount('#app')

app.config.errorHandler = (err: unknown) => {
  const store = useReportErrorStore()
  store.showDialog(err)
}
