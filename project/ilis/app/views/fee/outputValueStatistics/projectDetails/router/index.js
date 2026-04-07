import * as VueRouter from 'vue-router'

// 列表页
import projectDetails from '../projectDetails/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'projectDetails',
      component: projectDetails,
    },
  ],
})

export default router
