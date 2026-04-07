import { captureException } from '~/internal/tracing'
import { TaskLedger } from '~/views/common/humiture/taskLedger'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_hum_task_ledger')

  if (!el) {
    console.warn('#common_hum_task_ledger not found')
    return
  }

  const app = createApp(TaskLedger, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_hum_task_ledger')
})()
