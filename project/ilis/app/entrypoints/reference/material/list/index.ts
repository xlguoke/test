import { captureException } from '~/internal/tracing'
import Index from '~/views/equipment/material/standard-material-ledger/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#ref_material')

  if (!el) {
    console.warn('#ref_material not found')
    return
  }

  const app = createApp(Index, {})

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#ref_material')
})()
