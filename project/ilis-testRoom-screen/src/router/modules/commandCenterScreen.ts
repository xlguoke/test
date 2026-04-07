export default [
  {
    path: "/commandCenterScreen",
    name: "commandCenterScreen",
    meta: {
      title: "指挥中心驾驶舱"
    },
    component: () => import("@/views/commandCenterScreen/index.vue"),
    children: [
      {
        path: "",
        name: "commandCenterScreenHome",
        component: () => import("@/views/commandCenterScreen/home/index.vue"),
        meta: {
          title: "首页"
        }
      },
      {
        path: "dataCenter",
        name: "commandCenterScreenDataCenter",
        component: () => import("@/views/commandCenterScreen/dataCenter/index.vue"),
        meta: {
          title: "数据中心"
        }
      },
      {
        path: "testMonitor",
        name: "commandCenterScreenTestMonitor",
        component: () => import("@/views/commandCenterScreen/testMonitor/index.vue"),
        meta: {
          title: "检测机构监控"
        }
      },
      {
        path: "labMgt",
        name: "commandCenterScreenLabMgt",
        component: () => import("@/views/commandCenterScreen/labMgt/index.vue"),
        meta: {
          title: "工地试验室管理"
        }
      }
    ]
  }
]
