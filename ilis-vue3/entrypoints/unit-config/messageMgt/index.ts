import '~/main.css'
import { MessageMgt } from '../../../views/unit-config/messageMgt'
import { captureException } from '~/internal/tracing'

(async function () {
  const el = document.querySelector<HTMLElement>('#message_mgt')

  if (!el) {
    console.warn('#message_mgt not found')
    return
  }

  const app = createApp(MessageMgt, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#message_mgt')
})()
