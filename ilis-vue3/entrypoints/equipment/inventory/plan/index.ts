import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentInventoryPlanVue from '~/views/equipment/inventory/plan/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#inventory_plan')

  if (!el) {
    console.warn('#inventory_plan not found')
    return
  }

  const app = createApp(EquipmentInventoryPlanVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#inventory_plan')
})()
