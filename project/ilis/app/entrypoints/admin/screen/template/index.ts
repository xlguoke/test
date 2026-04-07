import { captureException } from '~/internal/tracing'
import Main from '~/views/admin/screen/templateManagement/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#screenTemplate')

  if (!el) {
    console.warn('#screenTemplate not found')
    return
  }

  const { count, used } = el.dataset

  const app = createApp(Main, {
    count,
    used,
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#screenTemplate')
})()
