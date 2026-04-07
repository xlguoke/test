import { createRouter, createWebHashHistory } from "vue-router"
import WebLayout from "@/views/layout/Index.vue"

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Layout",
      component: WebLayout,
      redirect: "/",
      children: [
        {
          path: "/",
          name: "Home",
          component: () => import("@/views/home/Home.vue"), //首页
          meta: {
            activekey: "Home"
          }
        },
        {
          path: "/msgQuery",
          name: "MsgQuery",
          component: () => import("@/views/msgQuery/MsgQuery.vue"), //信息查询
          meta: {
            activekey: "MsgQuery"
          }
        },
        {
          path: "/aboutUs",
          name: "AboutUs",
          component: () => import("@/views/aboutUs/AboutUs.vue"), //关于我们
          meta: {
            activekey: "AboutUs"
          }
        },
        {
          path: "/unitSignIn",
          name: "UnitSignIn",
          component: () => import("@/views/unitSignIn/UnitSignIn.vue") //机构注册
        },
        {
          path: "/botSignIn",
          name: "BotSignIn",
          component: () => import("@/views/botSignIn/BotSignIn.vue") //建设单位注册
        },
        {
          path: "/news/:id",
          name: "newsList",
          component: () => import("@/views/news/NewsList.vue") // 新闻类列表数据【通知公告、政策文件、技术交流、常见问题、搜索、用户手册】
        },
        {
          path: "/newsDetail",
          name: "NewsDetail",
          component: () => import("@/views/newsDetail/NewsDetail.vue") //新闻类详情页面
        },
        {
          path: "/technical/detail",
          name: "TechnicalDetail",
          component: () => import("@/views/newsDetail/TechnicalDetail.vue"), //技术交流详情
          meta: {
            activekey: "Technical"
          }
        }
      ]
    },
    {
      path: "/phone/qrReport",
      name: "qrReport",
      component: () => import("@/views/phone/qrReport.vue") // 手机端扫码查询报告
    },
    {
      path: "/phone/changeHistory",
      name: "changeHistory",
      component: () => import("@/views/phone/changeHistory.vue") // 手机端报告更正记录
    },
    {
      path: "/phone/sampleChangeDetail",
      name: "sampleChangeDetail",
      component: () => import("@/views/phone/sampleChangeDetail.vue") // 手机端报告更正记录
    },
    {
      path: "/phone/queryHistory",
      name: "queryHistory",
      component: () => import("@/views/phone/queryHistory.vue") // 手机端报告查询记录
    }
  ]
})

export default router
