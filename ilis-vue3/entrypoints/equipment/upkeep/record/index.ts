import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentUpkeepRecord from '~/views/equipment/upkeep/record/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_upkeep_record')

  if (!el) {
    console.warn('#common_eq_upkeep_record not found')
    return
  }

  const app = createApp(EquipmentUpkeepRecord, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_upkeep_record')
})()
