import '~/main.css'
import { captureException } from '~/internal/tracing'
import { Specification } from '~/views/consign/component/selectSpecification'

(async function () {
  const el = document.querySelector<HTMLElement>('#select_specification')

  if (!el) {
    console.warn('#select_specification not found')
    return
  }

  const { catalog } = el.dataset
  const app = createApp(Specification, {
    catalog: catalog ? JSON.parse(catalog) : undefined,
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#select_specification')
})()
