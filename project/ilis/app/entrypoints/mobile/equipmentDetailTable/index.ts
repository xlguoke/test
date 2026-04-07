import { captureException } from '~/internal/tracing'
import Main from '~/views/mobile/equipmentDetailTable/App/index.vue'
import router from '~/views/mobile/equipmentDetailTable/router/index.ts'
import '~/main.ts'
import '~/providers-moblie/common/global.less';

(async function () {
  const el = document.querySelector<HTMLElement>('#equipmentDetailTable')

  if (!el) {
    console.warn('#equipmentDetailTable not found')
    return
  }

  const app = createApp(Main, {})

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(router)

  app.mount('#equipmentDetailTable')
})()
