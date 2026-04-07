import { captureException } from '~/internal/tracing'
import Main from '~/views/mobile/equipmentDetailTableNotLogin/App/index.vue'
import router from '~/views/mobile/equipmentDetailTableNotLogin/router/index.ts'
import '~/main.ts'
import '~/providers-moblie/common/global.less';

(async function () {
  const el = document.querySelector<HTMLElement>('#equipmentDetailTableNotLogin')

  if (!el) {
    console.warn('#equipmentDetailTableNotLogin not found')
    return
  }

  const app = createApp(Main, {})

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(router)

  app.mount('#equipmentDetailTableNotLogin')
})()
