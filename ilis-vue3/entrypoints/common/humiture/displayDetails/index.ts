import '~/main.css'
import { captureException } from '~/internal/tracing'
import { Main } from '~/views/common/humiture/displayDetails'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_hum_display_details')

  if (!el) {
    console.warn('#common_hum_display_details not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_hum_display_details')
})()
