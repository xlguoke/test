import '~/main.css'
import { captureException } from '~/internal/tracing'
import { CheckSendAdd } from '~/views/equipment/check/checkSendAdd'

(async function () {
  const el = document.querySelector<HTMLElement>('#check_send_add')

  if (!el) {
    console.warn('#check_send_add not found')
    return
  }

  const app = createApp(CheckSendAdd, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#check_send_add')
})()
