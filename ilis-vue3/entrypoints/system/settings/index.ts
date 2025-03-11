import '~/main.css'
import { Settings } from '~/system/settings'
import { captureException } from '~/internal/tracing'

(function () {
  const el = document.querySelector<HTMLElement>('#js-setting-app')

  if (!el) {
    console.warn('#js-setting-app not found')
    return
  }

  const { catalog } = el.dataset

  const app = createApp(Settings, {
    catalog: JSON.parse(catalog!),
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#js-setting-app')
})()
