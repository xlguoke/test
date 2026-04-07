import * as VueRouter from 'vue-router'

import PhotoMergePDF from '../list/components/PhotoMergePDF.vue'
// 列表页
import list from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
      // meta: {
      //   functionCode: ""
      // }
    },
    {
      path: '/photoManage',
      name: 'photoManage',
      component: PhotoMergePDF,
    },
  ],
})

export default router
