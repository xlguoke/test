import * as VueRouter from 'vue-router'

import printConfiguration from '../index/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'printConfiguration',
      component: printConfiguration,
    },
  ],
})

export default router
