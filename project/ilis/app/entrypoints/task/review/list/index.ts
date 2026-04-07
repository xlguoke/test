import { captureException } from '~/internal/tracing'
import View from '~/views/task/review/indexByIndustry.vue'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#un_task_review_info')

  if (!el) {
    console.warn('#un_task_review_info not found')
    return
  }

  const app = createApp(View, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#un_task_review_info')
})()
