import * as VueRouter from 'vue-router'

import table from '../table/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'updateTable',
      component: table,
    },
  ],
})

export default router
