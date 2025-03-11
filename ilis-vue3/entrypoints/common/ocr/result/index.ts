import '~/main.css'
import { OcrResult } from '~/views/equipment/check/ocr'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_ocr')

  if (!el) {
    console.warn('#common_ocr not found')
    return
  }

  const app = createApp(OcrResult, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_ocr')
})()
