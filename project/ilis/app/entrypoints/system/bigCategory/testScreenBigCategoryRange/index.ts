import { captureException } from '~/internal/tracing'
import Main from '~/views/system/bigCategory/testScreenBigCategoryRange/List.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#testScreenBigCategoryRange')

  if (!el) {
    console.warn('#testScreenBigCategoryRange not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#testScreenBigCategoryRange')
})()
