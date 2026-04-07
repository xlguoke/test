import * as VueRouter from 'vue-router'

import SealApply from '../components/SealApply.vue'
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
          'stamp_audit_submit,assign_stamp_user,auto_match_stamp,change_report_seal,stamp_audit_recall,set_file_stamp,notice_edit_consign,report_back,set_cross_page_stamp',
      },
    },
    {
      path: '/detail',
      name: 'detail',
      component: SealApply,
      meta: {
        functionCode: '',
      },
    },
  ],
})

export default router
