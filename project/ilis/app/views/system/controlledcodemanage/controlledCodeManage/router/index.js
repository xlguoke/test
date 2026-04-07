import * as VueRouter from 'vue-router'

// 业务项目管理列表页
import list from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
      meta: {
        functionCode: 'syncCenterCode',
      },
    },
  ],
})

export default router
