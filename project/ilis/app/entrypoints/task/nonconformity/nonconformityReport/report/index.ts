import { captureException } from '~/internal/tracing'
import Main from '~/views/task/nonconformity/nonconformityReport/Report.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#unqualified_reporting')

  if (!el) {
    console.warn('#unqualified_reporting not found')
    return
  }

  const app = createApp(Main, {
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#unqualified_reporting')
})()
