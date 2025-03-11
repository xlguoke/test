import '~/main.css'
import { captureException } from '~/internal/tracing'
import ApplyDetails from '~/views/common/purchaseRequest/ApplyDetails.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#purchase_request_details')

  if (!el) {
    console.warn('#purchase_request_details not found')
    return
  }

  const app = createApp(ApplyDetails, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#purchase_request_details')
})()
