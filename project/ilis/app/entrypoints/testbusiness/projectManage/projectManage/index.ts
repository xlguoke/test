import { captureException } from '~/internal/tracing'
import ProjectMergeVue from '~/views/testbusiness/projectManage/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#project_manage')

  if (!el) {
    console.warn('#project_manage not found')
    return
  }

  const app = createApp(ProjectMergeVue, {})

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#project_manage')
})()
