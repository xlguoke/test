import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentSoftware from '~/views/equipment/software/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_software')

  if (!el) {
    console.warn('#common_eq_software not found')
    return
  }

  const app = createApp(EquipmentSoftware, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_software')
})()
