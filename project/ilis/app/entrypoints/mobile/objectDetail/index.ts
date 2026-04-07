import Vant from 'vant'
import { captureException } from '~/internal/tracing'
import Main from '~/views/mobile/objectDetail/App/index.vue'
import router from '~/views/mobile/objectDetail/router/index.ts'
import '~/main.ts'
import '~/providers-moblie/common/global.less'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#objectDetail')

  if (!el) {
    console.warn('#objectDetail not found')
    return
  }

  const app = createApp(Main, {})

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(router).use(Vant)

  app.mount('#objectDetail')
})()
