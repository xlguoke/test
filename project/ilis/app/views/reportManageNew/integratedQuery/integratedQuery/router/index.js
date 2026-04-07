import * as VueRouter from 'vue-router'

// 列表页
import list from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
      meta: {
        functionCode: 'export_all,view_consign,view_report,view_log',
      },
    },
  ],
})

export default router
