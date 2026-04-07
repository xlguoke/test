import { captureException } from '~/internal/tracing'
import List from '~/views/report/business/list.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#business_application')

  if (!el) {
    console.warn('#business_application not found')
    return
  }

  const app = createApp(List, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#business_application')
})()
