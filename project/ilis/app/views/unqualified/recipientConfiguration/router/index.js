import * as VueRouter from 'vue-router'

import ExternalStaff from '../externalStaff/index.vue' // 外部人员配置
import Insider from '../insider/index.vue' // 内部人员配置

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'ExternalStaff',
      component: ExternalStaff,
      meta: {
        functionCode: 'material_output_allot',
      },
    },
    {
      path: '/Insider',
      name: 'Insider',
      component: Insider,
      meta: {
        functionCode: 'material_output_recall,material_export,material_print',
      },
    },
  ],
})

export default router
