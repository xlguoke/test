import Vant from 'vant'
import { captureException } from '~/internal/tracing'
import { usePermissionStore } from '~/store/permissionStore.ts'
import Main from '~/views/mobileApp/app.vue'
import router from '~/views/mobileApp/router/index.ts'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'
import '~/views/mobileApp/main.ts'

(async function () {
  const el = document.querySelector<HTMLElement>('#mobile-app')

  if (!el) {
    console.warn('#mobile-app not found')
    return
  }

  const app = createApp(Main)

  await AppInitHelper.useMobilePermission(app)

  // 检查权限数据，移动端可以以此判断是否登录
  const permissionStore = usePermissionStore()

  if (!permissionStore.permissions || !Array.isArray(permissionStore.permissions)) {
    // 没有权限时，清理用户信息，剩下的就交给路由守卫了
    const appUserStore = useAppUserStore()
    appUserStore.$reset()
  }

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(router).use(Vant)

  app.mount('#mobile-app')
})()
