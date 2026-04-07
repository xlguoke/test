import { captureException } from '~/internal/tracing'
import biddingWorkbenches from '~/views/biddingManagement/biddingWorkbenches/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#biddingWorkbenches')

  if (!el) {
    console.warn('#biddingWorkbenches not found')
    return
  }

  const app = createApp(biddingWorkbenches, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#biddingWorkbenches')
})()
