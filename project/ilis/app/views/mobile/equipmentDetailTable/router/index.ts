import * as VueRouter from 'vue-router'

import detail from '../detail/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'detail',
      component: detail,
    },
  ],
})

export default router
