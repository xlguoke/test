import * as VueRouter from 'vue-router'
import List from '../list/index.vue'

const codeStr = ''
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'List',
      component: List,
      meta: {
        functionCode: codeStr,
      },
    },
  ],
})

export default router
