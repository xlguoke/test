import '~/main.css'
import { captureException } from '~/internal/tracing'
import { DirectConfirm } from '~/views/equipment/check/confirm'

(async function () {
  const el = document.querySelector<HTMLElement>('#check_confirm_list')

  if (!el) {
    console.warn('#check_confirm_list not found')
    return
  }

  const app = createApp(DirectConfirm, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#check_confirm_list')
})()
