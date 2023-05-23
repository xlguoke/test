import { createRouter, createWebHistory } from "vue-router"
import { storeToRefs } from "pinia"
import { Empty } from "ant-design-vue"
import Layout from "@/layout/index.vue"
import { getToken } from "@/utils/auth"
import menuTreeStores from "@/stores/menuTree"
import userInfoStores from "@/stores/userInfo"

// 白名单
const whiteList = ["/login", "/404", "/error", "/redirect"]

// 静态路由
const routeList = [
  {
    path: "/",
    name: "Layout",
    component: Layout,
    redirect: "/dashboard",
    children: []
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/index.vue")
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/error/404.vue")
  },
  {
    path: "/static/:pathMatch(.*)",
    component: Empty
  },
  {
    path: "/redirect",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routeList
})

router.beforeEach(async (to, form, next) => {
  const menuStores = menuTreeStores()
  const { menuTree } = storeToRefs(menuStores)
  const userStores = userInfoStores()

  if (getToken()) {
    if (to.path === "/login") {
      next({ path: "/" })
    } else {
      if (menuTree.value && menuTree.value.length) {
        next()
      } else {
        try {
          const routeData = await menuStores.getDynamicRoutes()
          routeData.forEach((route: any) => {
            router.addRoute("Layout", route)
          })
          next({ ...to, replace: true })
        } catch (err) {
          userStores.logout().then(() => {
            next({ path: "/login" })
          })
        }
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login`) // 否则全部重定向到登录页
    }
  }
})

export default router
