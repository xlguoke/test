import { captureException } from '~/internal/tracing'
import Main from '~/views/common/humiture/recordAbnormal/CheckDetail.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_hum_record_details')

  if (!el) {
    console.warn('#common_hum_record_details not found')
    return
  }

  const app = createApp(Main, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_hum_record_details')
})()
