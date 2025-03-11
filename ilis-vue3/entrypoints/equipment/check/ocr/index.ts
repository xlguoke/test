import '~/main.css'
import { captureException } from '~/internal/tracing'
import { Ocr } from '~/views/equipment/check/ocr'
// import Ocr from '~/views/equipment/check/confirm/printTemplate/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#equipment_cert_ocr')

  if (!el) {
    console.warn('#equipment_cert_ocr not found')
    return
  }

  const app = createApp(Ocr, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#equipment_cert_ocr')
})()
