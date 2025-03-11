import '~/main.css'
import { captureException } from '~/internal/tracing'
import { SnReocrd } from '~/views/unit-config/snRecord'

(async function () {
  const el = document.querySelector<HTMLElement>('#sn_log')

  if (!el) {
    console.warn('#sn_log not found')
    return
  }

  const app = createApp(SnReocrd, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#sn_log')
})()
