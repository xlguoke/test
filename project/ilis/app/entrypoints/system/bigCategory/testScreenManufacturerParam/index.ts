import { captureException } from '~/internal/tracing'
import Main from '~/views/system/bigCategory/testScreenManufacturerParam/List.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#testScreenManufacturerParam')

  if (!el) {
    console.warn('#testScreenManufacturerParam not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#testScreenManufacturerParam')
})()
