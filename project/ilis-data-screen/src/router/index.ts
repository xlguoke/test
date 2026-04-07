import { createRouter, createWebHashHistory } from "vue-router"
import { smartCockpitRouter } from "./smartCockpitRouter"
import { commandCenterRouter } from "./commandCenterRouter"

const routes = [
  {
    path: "/",
    redirect: "/homeScreen"
  },
  {
    path: "/homeScreen",
    name: "homeScreen",
    component: () => import("@/views/homeScreen/index.vue"),
    meta: {
      title: "首页屏"
    }
  },
  {
    path: "/dataScreen",
    name: "dataScreen",
    component: () => import("@/views/dataScreen/index.vue"),
    meta: {
      title: "数据屏"
    }
  },
  {
    path: "/dataScreen-jxtc",
    name: "dataScreen-jxtc",
    component: () => import("@/views/dataScreen-jxtc/index.vue"),
    meta: {
      title: "数据屏"
    }
  }
]

// 蜀工智慧驾驶舱
routes.push(smartCockpitRouter as any)
// 指挥中心大屏
routes.push(commandCenterRouter as any)

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
