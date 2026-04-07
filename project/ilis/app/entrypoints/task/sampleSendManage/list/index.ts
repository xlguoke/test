import { captureException } from '~/internal/tracing'
import Main from '~/views/task/sampleSendManage/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#sample_send_manage')

  if (!el) {
    console.warn('#sample_send_manage not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#sample_send_manage')
})()
