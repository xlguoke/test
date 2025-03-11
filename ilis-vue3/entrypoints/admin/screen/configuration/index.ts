import '~/main.css'
import { ScreenManage } from '~/views/admin/screen/configuration'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#screen')

  if (!el) {
    console.warn('#screen not found')
    return
  }

  const { count, used } = el.dataset

  const app = createApp(ScreenManage, {
    count,
    used,
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#screen')
})()
