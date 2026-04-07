import { captureException } from '~/internal/tracing'
import { SamplePreparation } from '~/views/testDetection/taskDetail'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#sample_preparation')

  if (!el) {
    console.warn('#sample_preparation not found')
    return
  }

  const app = createApp(SamplePreparation, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#sample_preparation')
})()
