import { captureException } from '~/internal/tracing'
import Main from '~/views/mobile/eqDetNotLogin/App/index.vue'
import router from '~/views/mobile/eqDetNotLogin/router/index.ts'
import '~/main.ts'
import '~/providers-moblie/common/global.less';

(async function () {
  const el = document.querySelector<HTMLElement>('#eqDetNotLogin')

  if (!el) {
    console.warn('#eqDetNotLogin not found')
    return
  }

  const app = createApp(Main, {})

  await AppInitHelper.useMobilePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(router)

  app.mount('#eqDetNotLogin')
})()
