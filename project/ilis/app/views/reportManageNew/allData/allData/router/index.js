import * as VueRouter from 'vue-router'

// 业务项目管理列表页
import List from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'List',
      component: List,
      meta: {
        functionCode: 'see-log',
      },
    },
  ],
})

export default router
