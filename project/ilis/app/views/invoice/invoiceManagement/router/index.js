import * as VueRouter from 'vue-router'

// 列表
import list from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
      meta: {
        functionCode:
          'invoice:add,invoice:edit,invoice:replace,invoice:del,invoice:export,invoice:custom,invoice:deprecate',
      },
    },
  ],
})

export default router
