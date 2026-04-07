import { captureException } from '~/internal/tracing'
import { WriteExample } from '~/views/unit-config/testSample'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#test_sample_write_example')

  if (!el) {
    console.warn('#test_sample_write_example not found')
    return
  }

  const app = createApp(WriteExample, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#test_sample_write_example')
})()
