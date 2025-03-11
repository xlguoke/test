import '~/main.css'
import { captureException } from '~/internal/tracing'
import { SelectSampleParam } from '~/views/consign/component/selectSampleParam'

(async function () {
  const el = document.querySelector<HTMLElement>('#selected_sample_param')

  if (!el) {
    console.warn('#selected_sample_param not found')
    return
  }

  const app = createApp(SelectSampleParam, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#selected_sample_param')
})()
