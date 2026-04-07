import { HtUploadFileJsp } from '~/components/htUploadFile'
import { captureException } from '~/internal/tracing'
import { AppInitHelper } from '~/utils/AppInitHelper'
import '~/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#ht_upload_file')

  if (!el) {
    console.warn('#ht_upload_file not found')
    return
  }

  const app = createApp(HtUploadFileJsp, {
  })

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.mount('#ht_upload_file')
})()
