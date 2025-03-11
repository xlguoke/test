import '~/main.css'
import { captureException } from '~/internal/tracing'
import { Main } from '~/views/consign/disableParamClickStatistic/index.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#disable_param_click_statistic')

  if (!el) {
    console.warn('#disable_param_click_statistic not found')
    return
  }

  const app = createApp(Main, {
  })

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#disable_param_click_statistic')
})()
