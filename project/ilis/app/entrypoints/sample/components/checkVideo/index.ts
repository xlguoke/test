import { captureException } from '~/internal/tracing'
import Main from '~/views/sample/components/checkVideo/Main.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#sample-check-video')

  if (!el) {
    console.warn('#sample-check-video not found')
    return
  }

  const app = createApp(Main)

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#sample-check-video')
})()
