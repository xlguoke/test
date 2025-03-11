import '~/main.css'
import { captureException } from '~/internal/tracing'
import CheckDetail from '~/views/common/humiture/ledger/CheckDetail.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_hum_ledger_details')

  if (!el) {
    console.warn('#common_hum_ledger_details not found')
    return
  }

  const app = createApp(CheckDetail, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_hum_ledger_details')
})()
