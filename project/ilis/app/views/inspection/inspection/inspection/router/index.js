import * as VueRouter from 'vue-router'

import Edit from '../list/edit.vue'
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
          'inspection:add,inspection:copy,inspection:delete,inspection:edit,inspection:reform',
      },
    },
    {
      path: '/edit',
      name: 'Edit',
      component: Edit,
      meta: {
        functionCode:
          'syncCenterCode,egressConfirm,rollback-egress,equipmentReturn,returnConfirm,modifyBorrower',
      },
    },
  ],
})

export default router
