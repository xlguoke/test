import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentAllotVue from '~/views/equipment/allot/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_allot')

  if (!el) {
    console.warn('#common_eq_allot not found')
    return
  }

  const app = createApp(EquipmentAllotVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_allot')
})()
