import * as VueRouter from 'vue-router'

import buildParamsEdit from '../views/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'buildParamsEdit',
      component: buildParamsEdit,
    },
  ],
})

export default router
