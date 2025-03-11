import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import EquipmentAssetAllotVue from '~/views/equipment/assets-allot/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_assets_allot')

  if (!el) {
    console.warn('#common_eq_assets_allot not found')
    return
  }

  const app = createApp(EquipmentAssetAllotVue, {})

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_assets_allot')
})()
