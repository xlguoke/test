import * as VueRouter from 'vue-router'

// ilis 跳转需要 详情界面
import AddRecord from '../list/components/addRecord.vue'
import list from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
    },
    {
      path: '/addRecord',
      name: 'AddRecord',
      component: AddRecord,
      meta: {
        functionCode: '',
      },
    },
  ],
})

export default router
