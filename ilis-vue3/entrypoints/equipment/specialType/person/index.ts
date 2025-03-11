import '~/main.css'
import { captureException } from '~/internal/tracing'
import { Main } from '~/views/equipment/specialType/person'

(async function () {
  const el = document.querySelector<HTMLElement>('#special_type_equipmnet_person')

  if (!el) {
    console.warn('#special_type_equipmnet_person not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#special_type_equipmnet_person')
})()
