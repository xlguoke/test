import * as VueRouter from 'vue-router'

// 流程审批页面
import list from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
    },
  ],
})

export default router
