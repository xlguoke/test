import AppProvider from '~/components/AppProvider.vue'
import { captureException } from '~/internal/tracing'
import '~/main.ts'
import '~/vant'

(async function () {
  const node = document.createElement('div')
  node.id = `app_provider_${Math.random().toString(36).slice(2)}`
  document.body.appendChild(node)

  const app = createApp(AppProvider, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount(`#${node.id}`)
})()
