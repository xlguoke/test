import '~/main.css'
import '~/main'
import { captureException } from '~/internal/tracing'
import InvInfo from '~/views/consign/evaluate/invInfo/index.vue'

(async function () {
  const el = document.querySelector<HTMLElement>('#evaluate_inv_info')

  if (!el) {
    console.warn('#evaluate_inv_info not found')
    return
  }

  const { params } = el.dataset

  const app = createApp(InvInfo, {
    params: JSON.parse(params!),
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#evaluate_inv_info')
})()
