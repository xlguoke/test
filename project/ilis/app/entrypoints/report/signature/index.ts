import { captureException } from '~/internal/tracing'
import View from '~/views/report/signature/index.vue'
// 签章
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#signature')

  if (!el) {
    console.warn('#signature not found')
    return
  }

  const app = createApp(View, {})

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#signature')
})()
