export default [
  {
    path: "/functionRoom2",
    component: () => import("@/views/functionRoom2/index.vue"),
    meta: {
      title: "功能室2.0"
    },
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/views/functionRoom2/view/home/index.vue"),
        meta: {
          title: "首页"
        }
      },
      {
        path: "detail",
        name: "detail",
        component: () => import("@/views/functionRoom2/view/roomDetail/index.vue"),
        meta: {
          title: "功能室详情"
        }
      },
      {
        path: "taskDetail",
        name: "taskDetail",
        component: () => import("@/views/functionRoom2/view/taskDetail/detail.vue"),
        meta: {
          title: "任务详情"
        }
      },
      {
        path: "consignDetail",
        name: "consignDetail",
        component: () => import("@/views/functionRoom2/view/taskDetail/consignDetail.vue"),
        meta: {
          title: "委托详情"
        }
      },
      {
        path: "taskList",
        name: "taskList",
        component: () => import("@/views/functionRoom2/view/taskDetail/index.vue"),
        meta: {
          title: "任务列表"
        }
      },
      {
        path: "sampleSendList",
        name: "sampleSendList",
        component: () => import("@/views/functionRoom2/view/sampleSend/index.vue"),
        meta: {
          title: "智能送样管理"
        }
      },
      {
        path: "sampleSendLog",
        name: "sampleSendLog",
        component: () => import("@/views/functionRoom2/view/sampleSend/SampleSendLog.vue"),
        meta: {
          title: "进度跟踪"
        }
      },
      {
        path: "checkDetail",
        name: "checkDetail",
        component: () => import("@/views/functionRoom2/view/checkDataDetail/index.vue"),
        meta: {
          title: "巡查详情"
        }
      },
      {
        path: "deviceDetail",
        name: "deviceDetail",
        component: () => import("@/views/functionRoom2/view/deviceDetail/index.vue"),
        meta: {
          title: "设备管理"
        }
      },
      {
        path: "customDetail",
        name: "customDetail",
        component: () => import("@/views/functionRoom2/view/customDetail/index.vue"),
        meta: {
          title: "详情"
        }
      },
      {
        path: "eqOutApply",
        name: "EqOutApply",
        component: () => import("@/views/functionRoom2/view/eqOutApply/index.vue"),
        meta: {
          title: "外出申请列表"
        }
      },
      {
        path: "eqOutApply/:id",
        name: "EqOutApplyDetail",
        component: () => import("@/views/functionRoom2/view/eqOutApply/components/Detail.vue"),
        meta: {
          title: "外出申请详情"
        }
      },
      {
        path: "userInfo",
        name: "userInfo",
        component: () => import("@/views/functionRoom2/view/accountDetail/index.vue"),
        meta: {
          title: "账号信息"
        }
      },
      {
        path: "standardRoomDetail",
        name: "StandardRoomDetail",
        component: () => import("@/views/functionRoom2/view/standardRoomDetail/index.vue"),
        meta: {
          title: "样品库存详情"
        }
      },
      {
        path: "externalCheckRoomDetail",
        name: "ExternalCheckRoomDetail",
        component: () => import("@/views/functionRoom2/view/externalCheckRoomDetail/index.vue"),
        meta: {
          title: "设备详情"
        }
      },
      {
        path: "standardSubstanceRoomDetail",
        name: "StandardSubstanceRoomDetail",
        component: () => import("@/views/functionRoom2/view/standardSubstanceRoomDetail/index.vue"),
        meta: {
          title: "标准物质详情"
        }
      },
      {
        path: "sampleRoomDetail",
        name: "SampleRoomDetail",
        component: () => import("@/views/functionRoom2/view/sampleRoomDetail/index.vue"),
        meta: {
          title: "样品详情"
        }
      },
      {
        path: "sampleStorageRoomDetail",
        name: "SampleStorageRoomDetail",
        component: () => import("@/views/functionRoom2/view/sampleStorageRoomDetail/index.vue"),
        meta: {
          title: "留样详情"
        }
      },
      {
        path: "medicineRoomDetail",
        name: "MedicineRoomDetail",
        component: () => import("@/views/functionRoom2/view/medicineRoomDetail/index.vue"),
        meta: {
          title: "药品详情"
        }
      }
    ]
  }
]
