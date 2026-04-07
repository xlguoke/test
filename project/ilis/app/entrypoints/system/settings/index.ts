import { captureException } from '~/internal/tracing'
import { index } from '~/system/settings'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#js-setting-app')

  if (!el) {
    console.warn('#js-setting-app not found')
    return
  }

  const { catalog } = el.dataset

  const app = createApp(index, {
    catalog: JSON.parse(catalog!),
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#js-setting-app')
})()
