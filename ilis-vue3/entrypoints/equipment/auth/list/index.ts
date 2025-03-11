import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import Main from '~/views/equipment/auth/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_eq_auth')

  if (!el) {
    console.warn('#common_eq_auth not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_eq_auth')
})()
