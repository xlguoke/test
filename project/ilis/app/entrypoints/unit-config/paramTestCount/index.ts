import { captureException } from '~/internal/tracing'
import Main from '../../../views/unit-config/paramTestCount/indexByIndustry.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#param_test_count')

  if (!el) {
    console.warn('#param_test_count not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#param_test_count')
})()
