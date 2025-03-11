import '~/main.css'
import { captureException } from '~/internal/tracing'
import { EqLocationQuery } from '~/views/equipment/locationQuery'

(async function () {
  const el = document.querySelector<HTMLElement>('#equipment_location')

  if (!el) {
    console.warn('#equipment_location not found')
    return
  }

  const app = createApp(EqLocationQuery, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#equipment_location')
})()
