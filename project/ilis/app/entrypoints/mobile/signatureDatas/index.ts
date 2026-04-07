import Vant from 'vant'
import { captureException } from '~/internal/tracing'
import SignatureDatas from '~/views/mobile/signatureDatas/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#signature_datas')

  if (!el) {
    console.warn('#signature_datas not found')
    return
  }

  const { source, unitcode, phone } = el.dataset

  const app = createApp(SignatureDatas, {
    unitcode,
    source,
    phone,
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(Vant)

  app.mount('#signature_datas')
})()
