import { captureException } from '~/internal/tracing'
import reportSealHistory from '~/views/report/sealManage/list.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#report_seal_history')
  if (!el) {
    console.warn('report_seal_history not found')
    return
  }
  const app = createApp(reportSealHistory, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#report_seal_history')
})()
