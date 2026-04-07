import * as VueRouter from 'vue-router'

// 列表页
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
          'newEgress,egressConfirm,rollback-egress,equipmentReturn,returnConfirm,modifyBorrower,eqPostponeConfirm,eqPostpone,egressDel',
      },
    },
  ],
})

export default router
