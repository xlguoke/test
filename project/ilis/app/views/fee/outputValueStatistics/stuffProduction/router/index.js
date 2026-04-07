import * as VueRouter from 'vue-router'

// 业务项目管理列表页
import Allocated from '../allocated/index.vue'
import WaitAllocated from '../waitAllocated/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'waitAllocated',
      component: WaitAllocated,
      meta: {
        functionCode: 'material_output_allot',
      },
    },
    {
      path: '/Allocated',
      name: 'Allocated',
      component: Allocated,
      meta: {
        functionCode: 'material_output_recall,material_export,material_print',
      },
    },
  ],
})

export default router
