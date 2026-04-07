import { captureException } from '~/internal/tracing'
import Main from '~/views/task/sampleSendManage/components/AddEntry.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#sampleSendManageAddEntry')

  if (!el) {
    console.warn('#sampleSendManageAddEntry not found')
    return
  }

  const app = createApp(Main, {})

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#sampleSendManageAddEntry')
})()
