import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentCheckParam from '~/views/equipment/check/param/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#check_param')

  if (!el) {
    console.warn('#check_param not found')
    return
  }

  const app = createApp(EquipmentCheckParam, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#check_param')
})()
