import { captureException } from '~/internal/tracing'
import ConfirmList from '~/views/equipment/check/confirmList/index.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#check_confirm_list')

  if (!el) {
    console.warn('#check_confirm_list not found')
    return
  }

  const app = createApp(ConfirmList, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#check_confirm_list')
})()
