import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentInventoryPlanDetailVue from '~/views/equipment/inventory/plan/component/PlanAuditDetail.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#inventory_plan_audit_detail')

  if (!el) {
    console.warn('#inventory_plan_audit_detail not found')
    return
  }

  const app = createApp(EquipmentInventoryPlanDetailVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#inventory_plan_audit_detail')
})()
