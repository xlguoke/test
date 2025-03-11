import '~/main.css'
import { captureException } from '~/internal/tracing'
import { EvaluateModel } from '~/views/consign/evaluate/model'

(async function () {
  const el = document.querySelector<HTMLElement>('#evaluate_model')

  if (!el) {
    console.warn('#evaluate_model not found')
    return
  }

  const app = createApp(EvaluateModel, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#evaluate_model')
})()
