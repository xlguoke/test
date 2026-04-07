import { captureException } from '~/internal/tracing'
import { Main } from '~/views/common/purchaseRequest'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#purchase_request')

  if (!el) {
    console.warn('#purchase_request not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#purchase_request')
})()
