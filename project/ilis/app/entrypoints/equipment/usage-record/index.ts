import { captureException } from '~/internal/tracing'
import EquipmentUsageRecord from '~/views/equipment/usage-record/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#eq_usage_record')

  if (!el) {
    console.warn('#eq_usage_record not found')
    return
  }

  const app = createApp(EquipmentUsageRecord, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#eq_usage_record')
})()
