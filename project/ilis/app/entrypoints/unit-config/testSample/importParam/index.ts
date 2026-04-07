import { captureException } from '~/internal/tracing'
import { ImportParam } from '~/views/unit-config/testSample'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#test_sample_import_param')

  if (!el) {
    console.warn('#test_sample_import_param not found')
    return
  }

  const app = createApp(ImportParam, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#test_sample_import_param')
})()
