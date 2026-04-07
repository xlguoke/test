import { captureException } from '~/internal/tracing'
import EquipmentAssetsAllotApplyVue from '~/views/equipment/assets-allot-apply/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_assets_allot_apply')

  if (!el) {
    console.warn('#common_assets_allot_apply not found')
    return
  }

  const app = createApp(EquipmentAssetsAllotApplyVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_assets_allot_apply')
})()
