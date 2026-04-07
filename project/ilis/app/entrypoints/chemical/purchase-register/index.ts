import { captureException } from '~/internal/tracing'
import Main from '~/views/chemical/purchase-register'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#chemical_purchase_register')

  if (!el) {
    console.warn('#chemical_purchase_register not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#chemical_purchase_register')
})()
