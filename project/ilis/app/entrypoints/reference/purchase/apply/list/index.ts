import { captureException } from '~/internal/tracing'
import Index from '~/views/equipment/material/purchase-apply/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#ref_purchase_apply')

  if (!el) {
    console.warn('#ref_purchase_apply not found')
    return
  }

  const app = createApp(Index, {})

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#ref_purchase_apply')
})()
