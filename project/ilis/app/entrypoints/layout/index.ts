import { captureException } from '~/internal/tracing'
import View from '~/layout/IframeLayout.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#layout')

  if (!el) {
    console.warn('#layout not found')
    return
  }
  const params = el.dataset

  const app = createApp(View, {
    params: { ...params },
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#layout')
})()
