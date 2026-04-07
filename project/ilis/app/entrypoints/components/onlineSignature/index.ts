import { OnlineSginatureModal } from '~/components/onlineSignature'
import { captureException } from '~/internal/tracing'
import { AppInitHelper } from '~/utils/AppInitHelper'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#online_signature')

  if (!el) {
    console.warn('#online_signature not found')
    return
  }

  const app = createApp(OnlineSginatureModal, {
    isJsp: true,
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#online_signature')
})()
