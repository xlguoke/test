import '~/main.css'
import { captureException } from '~/internal/tracing'
import Main from '~/views/unit-config/standard/SettingStandard/Main.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#standard_setting')

  if (!el) {
    console.warn('#standard_setting not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#standard_setting')
})()
