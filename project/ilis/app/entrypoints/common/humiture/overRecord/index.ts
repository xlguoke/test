import { captureException } from '~/internal/tracing'
import { Main } from '~/views/common/humiture/overRecord'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_hum_over_record')

  if (!el) {
    console.warn('#common_hum_over_record not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_hum_over_record')
})()
