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
          'keypoint:category:add,keypoint:category:edit,keypoint:category:delete,'
          + 'keypoint:category:cascade-delete,keypoint:add,keypoint:delete,keypoint:import,keypoint:export,keypoint:edit',
      },
    },
  ],
})

export default router
