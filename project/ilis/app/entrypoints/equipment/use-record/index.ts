import { captureException } from '~/internal/tracing'
import EquipmentUsageRecordForPrint from '~/views/equipment/usage-record/eqDetail-useRecord/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_use_record')

  if (!el) {
    console.warn('#common_eq_use_record not found')
    return
  }

  const app = createApp(EquipmentUsageRecordForPrint, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_use_record')
})()
