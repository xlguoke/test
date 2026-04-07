import { captureException } from '~/internal/tracing'
import inspectionCapacityManage from '~/views/testbusiness/inspectioncapacity/inspectionCapacityManage/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#inspectionCapacityManage')

  if (!el) {
    console.warn('#inspectionCapacityManage not found')
    return
  }

  const app = createApp(inspectionCapacityManage, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#inspectionCapacityManage')
})()
