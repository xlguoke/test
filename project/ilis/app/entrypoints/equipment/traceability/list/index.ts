import { captureException } from '~/internal/tracing'
import Traceability from '~/views/equipment/traceability/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_traceability')

  if (!el) {
    console.warn('#common_eq_traceability not found')
    return
  }

  const app = createApp(Traceability, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_traceability')
})()
