import '~/main.css'
import { captureException } from '~/internal/tracing'
import { StandardMaterialAccount } from '~/views/common/standardMaterial/account'

(async function () {
  const el = document.querySelector<HTMLElement>('#in_out_ledger')

  if (!el) {
    console.warn('#in_out_ledger not found')
    return
  }

  const app = createApp(StandardMaterialAccount, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#in_out_ledger')
})()
