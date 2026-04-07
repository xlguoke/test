import { captureException } from '~/internal/tracing'
import Entry from '~/views/report/amend/Entry.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#amend_application')

  if (!el) {
    console.warn('#amend_application not found')
    return
  }

  const app = createApp(Entry, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#amend_application')
})()
