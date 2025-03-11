import '~/main.css'
import { captureException } from '~/internal/tracing'
import { TaskReferenceRecord } from '~/views/testDetection/task/referenceRecord'

(async function () {
  const el = document.querySelector<HTMLElement>('#param_reference')

  if (!el) {
    console.warn('#param_reference not found')
    return
  }

  const app = createApp(TaskReferenceRecord, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#param_reference')
})()
