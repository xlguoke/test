import { captureException } from '~/internal/tracing'
import DictList from '~/views/unit-config/dataDict/DictList.vue'
import '~/main.css'

(async function () {
  const el = document.querySelector<HTMLElement>('#data-dict')

  if (!el) {
    console.warn('#data-dict not found')
    return
  }

  const app = createApp(DictList)

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#data-dict')
})()
