import { captureException } from '~/internal/tracing'
import IndustryList from '~/views/unit-config/industryConfig/IndustryList.vue'
import '~/main.css'

(async function () {
  const el = document.querySelector<HTMLElement>('#industry-config')

  if (!el) {
    console.warn('#industry-config not found')
    return
  }

  const app = createApp(IndustryList)

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#industry-config')
})()
