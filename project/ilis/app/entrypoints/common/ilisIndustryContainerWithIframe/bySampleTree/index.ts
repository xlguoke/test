import { captureException } from '~/internal/tracing'
import BySampleTree from '~/views/common/ilisIndustryContainerWithIframe/BySampleTree.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#industry-container-sampletree')
  if (!el) {
    console.warn('#industry-container-sampletree not found')
    return
  }
  const { redirect } = el.dataset

  const app = createApp(BySampleTree, {
    redirect,
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#industry-container-sampletree')
})()
