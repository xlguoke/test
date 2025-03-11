import '~/main.css'
import { captureException } from '~/internal/tracing'
import DetailForProcess from '~/views/common/train/plan/components/DetailForProcess.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#train_plan')

  if (!el) {
    console.warn('#train_plan not found')
    return
  }

  const app = createApp(DetailForProcess, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#train_plan')
})()
