import { captureException } from '~/internal/tracing'
import Main from '~/views/mobile/wxmessage/App/index.vue'
import router from '~/views/mobile/wxmessage/router/index.ts'
import '~/main.ts'
import '~/providers-moblie/common/global.less';

(async function () {
  const el = document.querySelector<HTMLElement>('#wxmessage')

  if (!el) {
    console.warn('#wxmessage not found')
    return
  }

  const app = createApp(Main, {})

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(router)

  app.mount('#wxmessage')
})()
