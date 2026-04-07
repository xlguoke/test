import * as VueRouter from 'vue-router'

import invoice from '../invoice/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'invoice',
      component: invoice,
    },
  ],
})

export default router
