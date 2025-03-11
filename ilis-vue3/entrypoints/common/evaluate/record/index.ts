import '~/main.css'
import { captureException } from '~/internal/tracing'
import { EvaluateRecord } from '~/views/consign/evaluate/record'

(async function () {
  const el = document.querySelector<HTMLElement>('#evaluate_model')

  if (!el) {
    console.warn('#evaluate_model not found')
    return
  }

  const app = createApp(EvaluateRecord, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#evaluate_model')
})()
