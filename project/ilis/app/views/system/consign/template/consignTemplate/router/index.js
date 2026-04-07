import * as VueRouter from 'vue-router'

import Main from '../index/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main,
    },
  ],
})

export default router
