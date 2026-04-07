import { captureException } from '~/internal/tracing'
import ReportSignature from '~/views/report/compiled/signature/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#report_signature')

  if (!el) {
    console.warn('#report_signature not found')
    return
  }

  const app = createApp(ReportSignature, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#report_signature')
})()
