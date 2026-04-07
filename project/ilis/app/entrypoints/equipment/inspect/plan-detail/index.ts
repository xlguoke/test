import { captureException } from '~/internal/tracing'
import EquipmentInspectPlan from '~/views/equipment/inspect/plan/component/AuditDetail.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_equipment_inspect_plan_detail')

  if (!el) {
    console.warn('#common_equipment_inspect_plan_detail not found')
    return
  }

  const app = createApp(EquipmentInspectPlan, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_equipment_inspect_plan_detail')
})()
