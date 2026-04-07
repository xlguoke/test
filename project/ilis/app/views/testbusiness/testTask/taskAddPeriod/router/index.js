import * as VueRouter from 'vue-router'

// 列表页
import list from '../list/index.vue'
import SmartTag from '../smartTag.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
    },
    {
      path: '/smartTag',
      name: 'SmartTag',
      component: SmartTag,
      meta: {
        functionCode: '',
      },
    },
  ],
})

export default router
