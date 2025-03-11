import '~/main.css'
import { QchjVideo } from '~/components/qchjVideo'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#task-video-playback')

  if (!el) {
    console.warn('#task-video-playback not found')
    return
  }

  const app = createApp(QchjVideo, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#task-video-playback')
})()
