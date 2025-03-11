import '~/main.css'
import { captureException } from '~/internal/tracing'
import { Standard } from '~/views/unit-config/standard'

(async function () {
  const el = document.querySelector<HTMLElement>('#standard_manage')

  if (!el) {
    console.warn('#standard_manage not found')
    return
  }

  const app = createApp(Standard, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#standard_manage')
})()
