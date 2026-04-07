import { createRouter, createWebHashHistory } from 'vue-router/auto'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import type { EnhancedRouteLocation } from './types'
import useRouteCacheStore from '@/stores/modules/routeCache'
import { usePermissionStore } from '@/stores'
import { isLogin } from '@/utils/auth'
import setPageTitle from '@/utils/set-page-title'
import { InEmbed } from '@/utils/referrer'
import { FunctionType } from '@/interface/IPermissionEntity'

NProgress.configure({ showSpinner: false, parent: '#app' })

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_APP_PUBLIC_PATH),
  routes,
})

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
  handleHotUpdate(router)
}

router.beforeEach(async (to: EnhancedRouteLocation, _from, next) => {
  NProgress.start()

  const routeCacheStore = useRouteCacheStore()

  // Route cache
  routeCacheStore.addRoute(to)

  // Set page title
  setPageTitle(to.meta.title)

  if (!InEmbed) {
    if (!isLogin() && to.name !== 'login') {
      next({ name: 'login' })
      return
    }

    if (isLogin()) {
      const { getPermissionAll, permissions } = usePermissionStore()
      if (!permissions.length) {
        await getPermissionAll(FunctionType.EXECUTE)
      }

      if (to.name === 'login') {
        next({ name: 'home' })
        return
      }
    }
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
