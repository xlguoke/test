import { captureException } from '~/internal/tracing'
import Main from '~/views/task/components/voiceRecord.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#voice_record')

  if (!el) {
    console.warn('#voice_record not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#voice_record')
})()
