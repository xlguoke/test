import '~/main.css'
import { captureException } from '~/internal/tracing'
import { Main } from '~/views/common/humiture/log'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_hum_log')

  if (!el) {
    console.warn('#common_hum_log not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_hum_log')
})()
