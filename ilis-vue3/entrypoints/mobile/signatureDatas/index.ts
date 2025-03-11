import '~/main.css'
import '~/main.ts'
import SignatureDatas from '~/views/mobile/signatureDatas/index.vue'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#signature_datas')

  if (!el) {
    console.warn('#signature_datas not found')
    return
  }

  const app = createApp(SignatureDatas, {
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#signature_datas')
})()
