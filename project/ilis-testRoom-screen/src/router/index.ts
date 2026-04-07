import { createRouter, createWebHashHistory } from "vue-router"
import { storeToRefs } from "pinia"
import functionRoom from "./modules/functionRoom"
import commandCenterScreen from "./modules/commandCenterScreen"
import functionRoom2 from "./modules/functionRoom2.0"
import { useStore } from "@/store"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    // 功能室操作屏
    ...functionRoom,
    // 功能室操作屏(改版UI)
    ...functionRoom2,
    // {
    //   path: "/",
    //   redirect: "/binding"
    // },
    {
      path: "/binding",
      component: () => import("@/views/Binding.vue"),
      meta: {
        title: "绑定页"
      }
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
      path: "/deviceSmallScreen",
      name: "deviceSmallScreen",
      component: () => import("@/views/deviceSmallScreen/index.vue"),
      meta: {
        title: "设备小屏"
      },
      children: [
        {
          path: "",
          name: "deviceSmallScreenHome",
          component: () => import("@/views/deviceSmallScreen/Home/index.vue"),
          meta: {
            title: "设备小屏主页面"
          }
        },
        {
          path: "detail",
          name: "deviceSmallScreenDetail",
          component: () => import("@/views/deviceSmallScreen/detail/index.vue"),
          meta: {
            title: "设备详情"
          }
        },
        {
          path: "workingManual",
          name: "deviceSmallScreenWorkingManual",
          component: () => import("@/views/deviceSmallScreen/workingManual/index.vue"),
          meta: {
            title: "操作指南"
          }
        },
        {
          path: "checkDetail",
          name: "deviceSmallScreenCheckDetail",
          component: () => import("@/views/deviceSmallScreen/checkDetail/index.vue"),
          meta: {
            title: "校验详情"
          }
        },
        {
          path: "deviceRecord",
          name: "deviceSmallScreenDeviceRecord",
          component: () => import("@/views/deviceSmallScreen/deviceRecord/index.vue"),
          meta: {
            title: "设备使用台账"
          }
        }
      ]
    },
    {
      path: "/cutRoomScreen",
      name: "cutRoomScreen",
      component: () => import("@/views/cutRoomScreen/index.vue"),
      meta: {
        title: "剪压室功能大屏"
      }
    },
    {
      path: "/outRoomScreen",
      name: "outRoomScreen",
      component: () => import("@/views/outRoomScreen/index.vue"),
      meta: {
        title: "外检室数据大屏"
      }
    },
    {
      path: "/hallSeatScreen",
      name: "hallSeatScreen",
      meta: {
        title: "大厅座式屏"
      },
      children: [
        {
          path: "/hallSeatScreen",
          name: "hallSeatScreen",
          component: () => import("@/views/hallSeatScreen/index.vue"),
          meta: {
            title: "大厅座式屏"
          }
        },
        {
          path: "/hallSeatScreen/companyInfo",
          name: "companyInfo",
          component: () => import("@/views/hallSeatScreen/components/CompanyInfo.vue"),
          meta: {
            title: "公司信息"
          }
        },
        {
          path: "/hallSeatScreen/businessInfo",
          name: "businessInfo",
          component: () => import("@/views/hallSeatScreen/components/BusinessInfo.vue"),
          meta: {
            title: "业务概览"
          }
        }
      ]
    },
    {
      path: "/insetApp",
      name: "/insetApp",
      component: () => import("@/views/insetApp/index.vue"),
      meta: {
        title: "嵌入应用"
      }
    },
    // 湖北瑞达指挥中心驾驶舱
    ...commandCenterScreen
  ]
})

// 无需屏幕配置逻辑的大屏
export const ScreenConfigWhiteList = ["/commandCenterScreen", "/commandCenterScreen/dataCenter"]

router.beforeEach(async (to, from) => {
  NProgress.start()
  console.log(to, from)

  // 不走屏幕配置逻辑的大屏无需进行下面判断
  if (!ScreenConfigWhiteList.find((url) => location.href.indexOf(url) !== -1)) {
    const store = useStore()
    const { isUpdateConf } = storeToRefs(store)
    if (to.path !== "/binding" && !store.getUnitCode()) {
      // 本地缓存没有单位编码，跳转绑定页
      return "/binding"
    }
    if ((to.path === "/" || to.path === "/binding") && isUpdateConf.value) {
      if (store.getUnitCode() && store.getScreenNo()) {
        // 路由中无法通过location.href重定向，直接刷新，在app.vue中实现跳转
        isUpdateConf.value = false
        return location.reload()
      } else {
        // 无配置时清除本地凭证，跳转绑定页
        store.removeUnitCode()
        return "/binding"
      }
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
