import '~/main.css'
import { ParamMaintenance } from '../../../views/unit-config/paramMaintenance'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#param_maintenance')

  if (!el) {
    console.warn('#param_maintenance not found')
    return
  }

  const app = createApp(ParamMaintenance, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#param_maintenance')
})()
