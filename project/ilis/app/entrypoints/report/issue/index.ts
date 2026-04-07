import { captureException } from '~/internal/tracing'
import { List } from '~/views/report/issue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#report_issue_list')

  if (!el) {
    console.warn('#report_issue_list not found')
    return
  }

  const app = createApp(List, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#report_issue_list')
})()
