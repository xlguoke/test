import { captureException } from '~/internal/tracing'
import ReportCompiled from '~/views/report/compiled/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#report_compiled')

  if (!el) {
    console.warn('#report_compiled not found')
    return
  }

  const app = createApp(ReportCompiled, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#report_compiled')
})()
