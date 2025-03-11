import '~/main.css'
import { captureException } from '~/internal/tracing'
import ConfirmHistory from '~/views/equipment/check/checkSend/component/ConfirmHistory.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#check_confirm_history_list')

  if (!el) {
    console.warn('#check_confirm_history_list not found')
    return
  }

  const app = createApp(ConfirmHistory, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#check_confirm_history_list')
})()
