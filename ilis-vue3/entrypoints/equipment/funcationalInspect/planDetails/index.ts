import '~/main.css'
import { captureException } from '~/internal/tracing'
import Main from '~/views/equipment/funcationalInspect/plan/AuditDetails.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#funcational_inspect_plan_details')

  if (!el) {
    console.warn('#funcational_inspect_plan_details not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#funcational_inspect_plan_details')
})()
