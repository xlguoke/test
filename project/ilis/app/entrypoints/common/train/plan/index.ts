import { captureException } from '~/internal/tracing'
import { TrainPlan } from '~/views/common/train/plan'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#train_plan')

  if (!el) {
    console.warn('#train_plan not found')
    return
  }

  const app = createApp(TrainPlan, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#train_plan')
})()
