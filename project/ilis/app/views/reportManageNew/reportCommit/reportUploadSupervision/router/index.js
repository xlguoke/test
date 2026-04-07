import * as VueRouter from 'vue-router'

import list from '../App/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
      meta: {
        functionCode:
          'oneClickReport,hyxtPushExport,reportedSupervisorySystem,rerecordSecurityCode,cancelRerecordSecurityCode,setReportedPersonnel,correctedReport,batchSettingSecurityCode',
      },
    },
  ],
})

export default router
