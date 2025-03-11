import '~/main.css'
import { captureException } from '~/internal/tracing'
import { StandardCheckNew } from '~/views/unit-config/standardCheckNew'

(async function () {
  const el = document.querySelector<HTMLElement>('#standard_check_new')

  if (!el) {
    console.warn('#standard_check_new not found')
    return
  }

  const app = createApp(StandardCheckNew, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#standard_check_new')
})()
