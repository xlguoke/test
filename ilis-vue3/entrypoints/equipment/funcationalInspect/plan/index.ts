import '~/main.css'
import { captureException } from '~/internal/tracing'
import Main from '~/views/equipment/funcationalInspect/plan/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#funcational_inspect_plan')

  if (!el) {
    console.warn('#funcational_inspect_plan not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#funcational_inspect_plan')
})()
