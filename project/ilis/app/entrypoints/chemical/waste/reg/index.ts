import { captureException } from '~/internal/tracing'
import { Main } from '~/views/chemical/waste/reg'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#chemical_waste_reg')

  if (!el) {
    console.warn('#chemical_waste_reg not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#chemical_waste_reg')
})()
