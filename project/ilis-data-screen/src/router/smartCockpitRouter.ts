import { RouteRecordRaw } from "vue-router"

/**
 * 蜀工智慧驾驶舱
 */
export const smartCockpitRouter: RouteRecordRaw = {
  path: "/smartCockpit",
  meta: {
    title: "智慧驾驶舱"
  },
  component: () => import("@/views/smartCockpit/index.vue"),
  children: [
    {
      path: "",
      name: "smartCockpitCompany",
      component: () => import("@/views/smartCockpit/company/index.vue"),
      meta: {
        title: "公司概况"
      }
    },
    {
      path: "overviewNew",
      name: "smartCockpitOverviewNew",
      component: () => import("@/views/smartCockpit/overviewNew/index.vue"),
      meta: {
        title: "综合监管"
      }
    },
    {
      path: "overview",
      name: "smartCockpitOverview",
      component: () => import("@/views/smartCockpit/overview/index.vue"),
      meta: {
        title: "母体概况"
      }
    },
    {
      path: "humanResources",
      name: "smartCockpitHuman",
      component: () => import("@/views/smartCockpit/humanResources/index.vue"),
      meta: {
        title: "人力资源监管"
      }
    },
    {
      path: "equipment",
      name: "smartCockpitEquipment",
      component: () => import("@/views/smartCockpit/equipment/index.vue"),
      meta: {
        title: "物资设备监管"
      }
    },
    {
      path: "sample",
      name: "smartCockpitSample",
      component: () => import("@/views/smartCockpit/sample/index.vue"),
      meta: {
        title: "委托样品监管"
      }
    },
    {
      path: "environment",
      name: "smartCockpitEnvironment",
      component: () => import("@/views/smartCockpit/environment/index.vue"),
      meta: {
        title: "环境监控监管"
      }
    },
    {
      path: "test",
      name: "smartCockpitTest",
      component: () => import("@/views/smartCockpit/test/index.vue"),
      meta: {
        title: "试验检测监管"
      }
    },
    {
      path: "siteTest",
      name: "smartCockpitSiteTest",
      component: () => import("@/views/smartCockpit/siteTest/index.vue"),
      meta: {
        title: "工地试验监管"
      }
    },
    {
      path: "monitor",
      name: "smartCockpitMonitor",
      component: () => import("@/views/smartCockpit/monitor/index.vue"),
      meta: {
        title: "智能楼宇监控"
      }
    }
  ]
}
