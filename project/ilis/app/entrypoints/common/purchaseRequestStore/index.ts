import { captureException } from '~/internal/tracing'
import RequestStore from '~/views/common/purchaseRequest/RequestStore.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#purchase_request_store')

  if (!el) {
    console.warn('#purchase_request_store not found')
    return
  }

  const app = createApp(RequestStore, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#purchase_request_store')
})()
