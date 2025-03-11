import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import SignatureVue from '~/views/mobile/signature/SignaturePage.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_rent_signer')

  if (!el) {
    console.warn('#common_eq_rent_signer not found')
    return
  }

  const app = createApp(SignatureVue, {
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_rent_signer')
})()
