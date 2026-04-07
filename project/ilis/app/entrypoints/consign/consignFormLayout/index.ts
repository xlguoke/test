import { captureException } from '~/internal/tracing'
import ConsignFormLayout from '~/views/consign/consignFormLayout/index.vue'
import '~/main.css'

(async function () {
  const el = document.querySelector<HTMLElement>('#consign-form-layout')

  if (!el) {
    console.warn('#consign-form-layout not found')
    return
  }

  const app = createApp(ConsignFormLayout)

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#consign-form-layout')
})()
