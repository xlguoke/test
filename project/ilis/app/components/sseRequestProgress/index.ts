import type { IProps } from './SseRequestProgress.vue'
import { captureException } from '~/internal/tracing'
import AppProvider from '../AppProvider.vue'
import SseRequestProgress from './SseRequestProgress.vue'
import '~/main.css'
import 'ant-design-vue/dist/reset.css'

export type { IProps } from './SseRequestProgress.vue'

class HandleProgress {
  progressRef = ref()
  constructor() {
    this.install()
  }

  async install() {
    const parentNode = document.createElement('div')
    const render = {
      render: () => {
        return h(
          AppProvider,
          { },
          { default: () => h(SseRequestProgress, { ref: this.progressRef }) },
        )
      },
    }
    const app = createApp(render)
    await AppInitHelper.usePermission(app)

    app.config.errorHandler = (err) => {
      captureException(err).catch(console.error)
    }

    document.body.appendChild(parentNode)
    app.mount(parentNode)
  }

  show(props: IProps) {
    this.progressRef.value?.showModal(props)
  }

  showLoading(description: string) {
    this.progressRef.value?.showLoading(description)
  }

  hideLoading() {
    this.progressRef.value?.closeModal()
  }
}

export default new HandleProgress()
