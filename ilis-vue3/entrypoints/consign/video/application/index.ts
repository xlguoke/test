import '~/main.css'
import { captureException } from '~/internal/tracing'
import { List } from '~/views/consign/video/application'

(async function () {
  const el = document.querySelector<HTMLElement>('#video_application')

  if (!el) {
    console.warn('#video_application not found')
    return
  }

  const app = createApp(List, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#video_application')
})()
