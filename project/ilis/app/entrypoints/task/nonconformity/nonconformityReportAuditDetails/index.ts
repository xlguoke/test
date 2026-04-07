import { captureException } from '~/internal/tracing'
import Main from '~/views/task/nonconformity/nonconformityReport/AuditDetails.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#nonconformity_report_audit_details')

  if (!el) {
    console.warn('#nonconformity_report_audit_details not found')
    return
  }

  const app = createApp(Main, {
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#nonconformity_report_audit_details')
})()
