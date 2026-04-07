import { captureException } from '~/internal/tracing'
import Main from '~/views/unit-config/userMgt/components/Add.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#user_add')

  if (!el) {
    console.warn('#user_add not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#user_add')
})()
