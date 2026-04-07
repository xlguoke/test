import * as VueRouter from 'vue-router'
import List from '../list/indexByIndustry.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'List',
      component: List,
      meta: {
        functionCode: '',
      },
    },
  ],
})

export default router
