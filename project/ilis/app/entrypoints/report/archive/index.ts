import { captureException } from '~/internal/tracing'
import View from '~/views/report/archive/index.vue'
import '~/main.ts'
import '~/main.css'

(async function () {
  const el = document.querySelector<HTMLElement>('#report_archive')

  if (!el) {
    console.warn('#report_archive not found')
    return
  }

  const app = createApp(View, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#report_archive')
})()
