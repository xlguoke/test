import { captureException } from '~/internal/tracing'
import Main from '~/views/mobile/applogin/App/index.vue'
import router from '~/views/mobile/applogin/router/index'
import '~/main.ts'
import '~/providers-moblie/common/global.less';

(async function () {
  const el = document.querySelector<HTMLElement>('#applogin')

  if (!el) {
    console.warn('#applogin not found')
    return
  }

  const app = createApp(Main, {})

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(router)

  app.mount('#applogin')
})()
