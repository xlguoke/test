import '~/main.css'
import { OnlineSginatureModal } from '~/components/onlineSignature'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#online_signature')

  if (!el) {
    console.warn('#online_signature not found')
    return
  }

  const app = createApp(OnlineSginatureModal, {
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#online_signature')
})()
