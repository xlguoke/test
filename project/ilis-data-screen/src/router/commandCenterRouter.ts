import { RouteRecordRaw } from "vue-router"

/**
 * 指挥中心大屏
 */
export const commandCenterRouter: RouteRecordRaw = {
  path: "/commandCenter",
  meta: {
    title: "指挥中心大屏"
  },
  component: () => import("@/views/commandCenterScreen/index.vue"),
  children: [
    {
      path: "",
      name: "commandCenterHome",
      component: () => import("@/views/commandCenterScreen/home/index.vue"),
      meta: {
        title: "首页"
      }
    },
    {
      path: "dataCenter",
      name: "commandCenterDataCenter",
      component: () => import("@/views/commandCenterScreen/dataCenter/index.vue"),
      meta: {
        title: "数据中心"
      }
    }
  ]
}
