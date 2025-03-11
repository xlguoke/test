import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentAssetVue from '~/views/equipment/asset/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_assets')

  if (!el) {
    console.warn('#common_eq_assets not found')
    return
  }

  const app = createApp(EquipmentAssetVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_assets')
})()
