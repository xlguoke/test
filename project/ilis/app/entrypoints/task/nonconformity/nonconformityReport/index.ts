import { captureException } from '~/internal/tracing'
import Main from '~/views/task/nonconformity/nonconformityReport/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#nonconformity_report')

  if (!el) {
    console.warn('#nonconformity_report not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#nonconformity_report')
})()
