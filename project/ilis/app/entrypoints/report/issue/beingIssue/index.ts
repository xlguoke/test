import { captureException } from '~/internal/tracing'
import View from '~/views/report/issue/beingIssue.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#report_being_issue_list')

  if (!el) {
    console.warn('#report_being_issue_list not found')
    return
  }

  const app = createApp(View, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#report_being_issue_list')
})()
