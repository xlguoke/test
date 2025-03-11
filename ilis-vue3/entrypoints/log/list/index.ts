import '~/main.css'
import { captureException } from '~/internal/tracing'
import { CommonSystemLog } from '~/components/commonSystemLog'

(async function () {
  const el = document.querySelector<HTMLElement>('#log_list')

  if (!el) {
    console.warn('#log_list not found')
    return
  }

  const app = createApp(CommonSystemLog, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#log_list')
})()
