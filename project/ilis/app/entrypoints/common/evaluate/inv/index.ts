import { captureException } from '~/internal/tracing'
import { EvaluateInv } from '~/views/consign/evaluate/inv'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#evaluate_model')

  if (!el) {
    console.warn('#evaluate_model not found')
    return
  }

  const app = createApp(EvaluateInv, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#evaluate_model')
})()
