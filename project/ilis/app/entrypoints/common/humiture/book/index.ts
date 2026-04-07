import { captureException } from '~/internal/tracing'
import Book from '~/views/common/humiture/book/List.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#common_hum_book')

  if (!el) {
    console.warn('#common_hum_book not found')
    return
  }

  const app = createApp(Book, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#common_hum_book')
})()
