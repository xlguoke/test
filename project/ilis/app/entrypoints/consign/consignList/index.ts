import { captureException } from '~/internal/tracing'
import List from '~/views/consign/consignList/index.vue'
import '~/main.ts'
// import List from '~/views/common/ilisIndustryContainerWithIframe/BySampleTree.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#consign-list')

  if (!el) {
    console.warn('#consign-list not found')
    return
  }

  const app = createApp(List)

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#consign-list')
})()
