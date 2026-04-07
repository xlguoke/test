import * as VueRouter from 'vue-router'
import Details from '../details/index.vue'
import List from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'List',
      component: List,
    },
    {
      path: '/details',
      name: 'details',
      component: Details,
    },
  ],
})

export default router
