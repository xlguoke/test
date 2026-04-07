import { captureException } from '~/internal/tracing'
import View from '~/views/common/file-manage/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#file-manage')

  if (!el) {
    console.warn('#file-manage not found')
    return
  }

  const app = createApp(View)

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#file-manage')
})()
