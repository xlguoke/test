import '~/main.css'
import { captureException } from '~/internal/tracing'
import { SampleInfo } from '~/views/testDetection/component/sampleInfo'

(async function () {
  const el = document.querySelector<HTMLElement>('#sample_info')

  if (!el) {
    console.warn('#sample_info not found')
    return
  }

  const app = createApp(SampleInfo, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#sample_info')
})()
