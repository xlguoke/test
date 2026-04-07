import * as VueRouter from 'vue-router'

import user from '../user/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'user',
      component: user,
    },
  ],
})

export default router
