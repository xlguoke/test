import * as VueRouter from 'vue-router'

import updateTable from '../updateTable/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'updateTable',
      component: updateTable,
    },
  ],
})

export default router
