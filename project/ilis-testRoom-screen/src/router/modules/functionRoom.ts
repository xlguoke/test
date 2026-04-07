export default [
  {
    path: "/functionRoom",
    redirect: "/functionRoom/testRoom",
    component: () => import("@/views/functionRoom/index.vue"),
    meta: {
      title: "功能室"
    },
    children: [
      {
        path: "testRoom",
        name: "testRoom",
        component: () => import("@/views/functionRoom/testRoom/index.vue"),
        meta: {
          title: "功能室"
        }
      },
      {
        path: "taskList",
        name: "testRoomTaskList",
        component: () => import("@/views/functionRoom/testRoom/taskList.vue"),
        meta: {
          title: "任务列表"
        }
      },
      {
        path: "standardRoom",
        name: "standardRoom",
        component: () => import("@/views/functionRoom/standardRoom/index.vue"),
        meta: {
          title: "标准物质间"
        }
      },
      {
        path: "maintainRoom",
        name: "maintainRoom",
        component: () => import("@/views/functionRoom/maintainRoom/index.vue"),
        meta: {
          title: "标准养护室"
        }
      },
      {
        path: "maintainRoomDetails",
        name: "maintainRoomDetails",
        component: () => import("@/views/functionRoom/maintainRoomDetails/index.vue"),
        meta: {
          title: "标准养护室详情"
        }
      },
      {
        path: "sampleRoom",
        name: "sampleRoom",
        component: () => import("@/views/functionRoom/sampleRoom/index.vue"),
        meta: {
          title: "样品室"
        }
      },
      {
        path: "sampleRoomDetails",
        name: "sampleRoomDetails",
        component: () => import("@/views/functionRoom/sampleRoomDetails/index.vue"),
        meta: {
          title: "样品室详情"
        }
      },

      {
        path: "retainSampleRoom",
        name: "retainSampleRoom",
        component: () => import("@/views/functionRoom/retainSampleRoom/index.vue"),
        meta: {
          title: "留样室列表"
        }
      },
      {
        path: "retainSampleRoomDetails",
        name: "retainSampleRoomDetails",
        component: () => import("@/views/functionRoom/retainSampleRoomDetails/index.vue"),
        meta: {
          title: "留样室详情"
        }
      },
      {
        path: "externalTestRoom",
        name: "externalTestRoom",
        component: () => import("@/views/functionRoom/externalTestRoom/index.vue"),
        meta: {
          title: "外检室"
        }
      },
      {
        path: "externalTestDetails",
        name: "externalTestDetails",
        component: () => import("@/views/functionRoom/externalTestDetails/index.vue"),
        meta: {
          title: "外检室详情"
        }
      },
      {
        path: "chemistryRoom",
        name: "chemistryRoom",
        component: () => import("@/views/functionRoom/chemistryRoom/index.vue"),
        meta: {
          title: "药品室"
        }
      }
    ]
  }
]
