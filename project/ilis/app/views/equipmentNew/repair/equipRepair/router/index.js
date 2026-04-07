import * as VueRouter from 'vue-router'

import AddEdit from '../list/components/addModal.vue'
// ilis 跳转需要 详情界面

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
        functionCode: '',
      },
    },
    {
      path: '/addEdit',
      name: 'AddEdit',
      component: AddEdit,
      meta: {
        functionCode: '',
      },
    },
  ],
})

export default router
