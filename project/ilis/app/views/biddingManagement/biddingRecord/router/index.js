import * as VueRouter from 'vue-router'

import list from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
      meta: {
        functionCode: 'biddingRecordEdit,biddingRecordDel',
      },
    },
  ],
})

export default router
