import * as VueRouter from 'vue-router'

import applicationRecord from '../applicationRecord/index.vue'
import contractTimeSettlement from '../contractTimeSettlement/index.vue'
import remittanceDetail from '../remittanceDetail/index.vue'
import settlementApply from '../settlementApply/index.vue'
import settlementConduct from '../settlementConduct/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/settlementConduct', // 合同任务结算
      name: 'settlementConduct',
      component: settlementConduct,
      meta: {},
    },
    {
      path: '/settlementApply', // 合同任务结算申请
      name: 'settlementApply',
      component: settlementApply,
      meta: {},
    },
    {
      path: '/contractTimeSettlement', // 合同时间点结算办理
      name: 'contractTimeSettlement',
      component: contractTimeSettlement,
      meta: {},
    },
    {
      path: '/applicationRecord', // 查看申请记录
      name: 'applicationRecord',
      component: applicationRecord,
      meta: {},
    },
    {
      path: '/remittanceDetail', // 回款明细
      name: 'remittanceDetail',
      component: remittanceDetail,
      meta: {},
    },
  ],
})

export default router
