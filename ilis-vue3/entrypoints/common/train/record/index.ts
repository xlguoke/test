import '~/main.css'
import { captureException } from '~/internal/tracing'
import { TrainRecord } from '~/views/common/train/record'

(async function () {
  const el = document.querySelector<HTMLElement>('#train_record')

  if (!el) {
    console.warn('#train_record not found')
    return
  }

  const app = createApp(TrainRecord, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#train_record')
})()
