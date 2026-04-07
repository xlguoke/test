import { captureException } from '~/internal/tracing'
import Index from '~/views/equipment/material/outbound-record/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#ref_stock_out')

  if (!el) {
    console.warn('#ref_stock_out not found')
    return
  }

  const app = createApp(Index, {})

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#ref_stock_out')
})()
