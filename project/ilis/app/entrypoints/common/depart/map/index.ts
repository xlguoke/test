import { captureException } from '~/internal/tracing'
import DepartMapVue from '~/views/common/depart/map/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#depart_map')

  if (!el) {
    console.warn('#depart_map not found')
    return
  }

  const app = createApp(DepartMapVue, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#depart_map')
})()
