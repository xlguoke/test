import '~/main.css'
import { captureException } from '~/internal/tracing'
import { EqGoOutAudit } from '~/views/equipment/eqGoOutAudit'

(async function () {
  const el = document.querySelector<HTMLElement>('#equipment_goout_aduit')

  if (!el) {
    console.warn('#equipment_goout_aduit not found')
    return
  }

  const app = createApp(EqGoOutAudit, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#equipment_goout_aduit')
})()
