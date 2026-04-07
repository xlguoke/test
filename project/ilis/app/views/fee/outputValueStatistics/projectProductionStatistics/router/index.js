import * as VueRouter from 'vue-router'

// 业务项目管理列表页
import List from '../list/list.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'projectProductionStatisticsList',
      component: List,
      meta: {
        functionCode: '',
      },
    },
  ],
})

export default router
