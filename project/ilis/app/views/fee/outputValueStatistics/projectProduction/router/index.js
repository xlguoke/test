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
        functionCode:
          'project_department_allot,project_user_allot,project_to_allot_recall',
      },
    },
    {
      path: '/Allocated',
      name: 'Allocated',
      component: Allocated,
      meta: {
        functionCode: 'project_allotted_recall,project_print',
      },
    },
  ],
})

export default router
