import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentUpkeepPlan from '~/views/equipment/upkeep/plan/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_upkeep_plan')

  if (!el) {
    console.warn('#common_eq_upkeep_plan not found')
    return
  }

  const app = createApp(EquipmentUpkeepPlan, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_upkeep_plan')
})()
