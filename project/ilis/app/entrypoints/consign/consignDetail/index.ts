import { captureException } from '~/internal/tracing'
import ConsignDetail from '~/views/consign/consignDetail/index.vue'
import '~/main.css'

(async function () {
  const el = document.querySelector<HTMLElement>('#consign-detail')

  if (!el) {
    console.warn('#consign-detail not found')
    return
  }

  const query = new URLSearchParams(window.location.search)
  const app = createApp(ConsignDetail, {
    status: query.get('status') || '',
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#consign-detail')
})()
