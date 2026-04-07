import Vant from 'vant'
import { captureException } from '~/internal/tracing'
import { usePermissionStore } from '~/store/permissionStore.ts'
import Main from '~/views/mobile/equipmentDetail/App/index.vue'
import router from '~/views/mobile/equipmentDetail/router/index'
import '~/main.ts'
import '~/vant'
import '~/providers-moblie/common/global.less'

(async function () {
  const el = document.querySelector<HTMLElement>('#equipmentDetail')

  if (!el) {
    console.warn('#equipmentDetail not found')
    return
  }

  const app = createApp(Main, {})

  await AppInitHelper.useMobilePermission(app)

  const { permissions } = usePermissionStore()

  // 通过是否有权限来判断用户是否已登录，未登录直接跳转登录页，避免进入详情页后接口异常再跳转登录
  if (!permissions || !permissions.length) {
    const { unitCode } = useUrlSearchParams()
    const backUrl = encodeURIComponent(window.location.href)

    let loginUrl = '/ilis2/loginController.do?goAppLogin'
    if (unitCode) {
      loginUrl += `&curCompany=${unitCode}`
    }
    loginUrl += `&targetUrl=${backUrl}`

    window.location.href = loginUrl
    return
  }

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(router).use(Vant)

  app.mount('#equipmentDetail')
})()
