import type { MenuTreeType } from "@/type/store/menu"

const dataList: Array<MenuTreeType> = [
  {
    name: "Home",
    path: "/dashboard",
    component: "views/appPage/dashboard/index.vue",
    children: [],
    meta: {
      title: "首页",
      icon: "icon-shouye1",
      keepAlive: true,
      auths: []
    }
  },
  {
    name: "BusinessMgr",
    path: "/businessMgr",
    component: "",
    meta: {
      icon: "icon-yewu",
      title: "业务管理",
      keepAlive: true,
      auths: []
    },
    children: [
      {
        name: "PreManagement",
        path: "/preManagement",
        component: "views/appPage/preManagement/index.vue",
        meta: {
          title: "来样预约管理",
          icon: "",
          keepAlive: true,
          auths: []
        }
      },
      {
        name: "ReportList",
        path: "/reportList",
        component: "views/appPage/reportList/index.vue",
        meta: {
          title: "报告进度管理",
          icon: "",
          keepAlive: true,
          auths: []
        }
      },
      {
        name: "NoticeList",
        path: "/noticeList",
        component: "views/appPage/noticeList/index.vue",
        meta: {
          title: "公告发布",
          icon: "",
          keepAlive: true,
          auths: []
        }
      }
    ]
  }
]

export default dataList
