import { captureException } from '~/internal/tracing'
import bDVue from '~/views/mobile/bindingPerson/index.vue'
import '~/main.ts'
import '~/vant'

(async function () {
  const el = document.querySelector<HTMLElement>('#bidding-person-barcode')

  if (!el) {
    console.warn('#bidding-person-barcode not found')
    return
  }

  const url = location.href || ''
  const urlArr = url.split('/').filter(item => item)
  const personId = urlArr.length >= 2 ? urlArr[urlArr.length - 2] : ''
  const unitCode = urlArr.length >= 1 ? urlArr[urlArr.length - 1] : ''

  const app = createApp(bDVue, {
    catalog: {
      personId,
      unitCode,
    },
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#bidding-person-barcode')
})()
