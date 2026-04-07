import * as VueRouter from 'vue-router'

// 列表页
import list from '../list/list.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
      meta: {
        functionCode:
          'category:add,category:delete,category:edit,'
          + 'category:custom,category:sn,category:key-point,category:code:edit,category:code:delete',
      },
    },
  ],
})

export default router
