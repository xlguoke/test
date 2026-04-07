import { captureException } from '~/internal/tracing'
import EquipmentAllotApplyVue from '~/views/equipment/allot-apply/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_allot_apply')

  if (!el) {
    console.warn('#common_eq_allot_apply not found')
    return
  }

  const app = createApp(EquipmentAllotApplyVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_allot_apply')
})()
