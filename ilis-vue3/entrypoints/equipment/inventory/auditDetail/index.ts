import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentInventoryRecordDetailVue from '~/views/equipment/inventory/record/component/RecordAuditDetail.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#inventory_audit_detail')

  if (!el) {
    console.warn('#inventory_audit_detail not found')
    return
  }

  const app = createApp(EquipmentInventoryRecordDetailVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#inventory_audit_detail')
})()
