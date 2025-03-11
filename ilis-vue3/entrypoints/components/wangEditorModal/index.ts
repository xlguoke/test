import '~/main.css'
import { WEditorModal } from '~/components/wangEditor'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#ht_wangeditor_modal')

  if (!el) {
    console.warn('#ht_wangeditor_modal not found')
    return
  }

  const app = createApp(WEditorModal, {
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#ht_wangeditor_modal')
})()
