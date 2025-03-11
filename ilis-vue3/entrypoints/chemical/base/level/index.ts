import '~/main.css'
import { captureException } from '~/internal/tracing'
import { Main } from '~/views/chemical/base/level'

(async function () {
  const el = document.querySelector<HTMLElement>('#chemical_base_level')

  if (!el) {
    console.warn('#chemical_base_level not found')
    return
  }

  const app = createApp(Main, {
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#chemical_base_level')
})()
