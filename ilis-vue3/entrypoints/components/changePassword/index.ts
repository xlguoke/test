import '~/main.css'
import ChangePassword from '~/components/changePassword/index.vue'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#change_password')

  if (!el) {
    console.warn('#change_password not found')
    return
  }

  const { catalog } = el.dataset

  const app = createApp(ChangePassword, {
    catalog: catalog ? JSON.parse(catalog) : undefined,
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#change_password')
})()
