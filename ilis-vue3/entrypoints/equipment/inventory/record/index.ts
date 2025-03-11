import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentInventoryRecordVue from '~/views/equipment/inventory/record/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#inventory_record')

  if (!el) {
    console.warn('#inventory_record not found')
    return
  }

  const app = createApp(EquipmentInventoryRecordVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#inventory_record')
})()
