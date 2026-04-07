import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import AppProvider from '~/components/AppProvider.vue'
import { captureException } from '~/internal/tracing'
import { ResetPassword } from '~/views/unit-config/userMgt'
import '~/main.ts'
import 'ant-design-vue/dist/reset.css'

class Handler {
  constructor() {
    this.install()
  }

  install() {
    const parentNode = document.createElement('div')
    const render = {
      render: () => {
        return h(AppProvider, {}, ResetPassword)
      },
    }
    const app = createApp(render)

    app.config.errorHandler = (err) => {
      captureException(err).catch(console.error)
    }

    document.body.appendChild(parentNode)
    app.mount(parentNode)
  }

  showModal(props: { userId: string }) {
    AnyDialogHelper.showModel(ResetPassword, props)
  }
}

(function () {
  window.vm_resetPassword = new Handler()
})()
