import * as VueRouter from 'vue-router'
import List from '../list/index.vue'

export default VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'List',
      component: List,
    },
  ],
})
