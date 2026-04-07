import Vant from 'vant'
import { captureException } from '~/internal/tracing'
import View from '~/views/mobile/doc/share/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#doc-share')

  if (!el) {
    console.warn('#doc-share not found')
    return
  }

  const app = createApp(View)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(Vant)

  app.mount('#doc-share')
})()
