import '~/main.css'
import { captureException } from '~/internal/tracing'
import { SelectSample } from '~/views/consign/component/selectSample'

(async function () {
  const el = document.querySelector<HTMLElement>('#select_sample')

  if (!el) {
    console.warn('#select_sample not found')
    return
  }

  const app = createApp(SelectSample, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#select_sample')
})()
