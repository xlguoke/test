import { captureException } from '~/internal/tracing'
import Main from '~/views/sample/transform/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#transform')

  if (!el) {
    console.warn('#transform not found')
    return
  }

  const app = createApp(Main)

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#transform')
})()
