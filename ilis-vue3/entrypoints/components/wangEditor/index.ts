import '~/main.css'
import WangEditor from '~/components/wangEditor'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#ht_wangeditor')

  if (!el) {
    console.warn('#ht_wangeditor not found')
    return
  }

  const app = createApp(WangEditor, {
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#ht_wangeditor')
})()
