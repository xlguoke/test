import '~/main.css'
import { captureException } from '~/internal/tracing'
import { CheckSend } from '~/views/equipment/check/checkSend'

(async function () {
  const el = document.querySelector<HTMLElement>('#check_send')

  if (!el) {
    console.warn('#check_send not found')
    return
  }

  const app = createApp(CheckSend, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#check_send')
})()
