import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentUpkeepPlanDetail from '~/views/equipment/upkeep/plan/component/AuditDetail.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_upkeep_plan_detail')

  if (!el) {
    console.warn('#common_eq_upkeep_plan_detail not found')
    return
  }

  const app = createApp(EquipmentUpkeepPlanDetail, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_upkeep_plan_detail')
})()
