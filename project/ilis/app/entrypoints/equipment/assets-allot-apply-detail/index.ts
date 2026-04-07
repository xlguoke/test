import { captureException } from '~/internal/tracing'
import EquipmentAssetsAllotApplyDetailVue from '~/views/equipment/allot-apply/component/Detail.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_assets_allot_apply_detail')

  if (!el) {
    console.warn('#common_assets_allot_apply_detail not found')
    return
  }

  const app = createApp(EquipmentAssetsAllotApplyDetailVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_assets_allot_apply_detail')
})()
