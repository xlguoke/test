import { captureException } from '~/internal/tracing'
import EquipmentAllotApplyDetailVue from '~/views/equipment/allot-apply/component/Detail.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_allot_apply_detail')

  if (!el) {
    console.warn('#common_eq_allot_apply_detail not found')
    return
  }

  const app = createApp(EquipmentAllotApplyDetailVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_allot_apply_detail')
})()
