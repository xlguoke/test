import { captureException } from '~/internal/tracing'
import ByTab from '~/views/common/ilisIndustryContainerWithIframe/ByTab.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#industry-container-tab')

  if (!el) {
    console.warn('#industry-container-tab not found')
    return
  }

  const { redirect } = el.dataset

  const app = createApp(ByTab, {
    redirect,
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#industry-container-tab')
})()
