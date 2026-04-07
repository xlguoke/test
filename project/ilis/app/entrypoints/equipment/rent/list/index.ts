import { captureException } from '~/internal/tracing'
import EquipmentRentVue from '~/views/equipment/rent/list.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_rent')

  if (!el) {
    console.warn('#common_eq_rent not found')
    return
  }

  const app = createApp(EquipmentRentVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_rent')
})()
