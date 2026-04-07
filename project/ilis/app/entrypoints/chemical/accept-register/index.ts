import { captureException } from '~/internal/tracing'
import Main from '~/views/chemical/accept-register'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#chemical_accept_register')

  if (!el) {
    console.warn('#chemical_accept_register not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#chemical_accept_register')
})()
