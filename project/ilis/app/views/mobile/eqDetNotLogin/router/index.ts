import * as VueRouter from 'vue-router'

import AppLogin from '../../applogin/login/index.vue'
import EqDetailAdd from '../../equipmentDetail/add/index.vue'
import EqDetailDispose from '../../equipmentDetail/dispose/index.vue'
import PostponeEq from '../../equipmentDetail/postponeEq/index.vue'
// 列表页
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
      path: '/detail',
      name: 'detail',
      redirect: '/',
    },
    {
      path: '/add/:unitCode/:isLogin?',
      name: 'add',
      component: EqDetailAdd,
    },
    {
      path: '/dispose/:id/:status/:isLogin?',
      name: 'dispose',
      component: EqDetailDispose,
    },
    {
      path: '/login',
      name: 'login',
      component: AppLogin,
    },
    {
      path: '/postponeEq',
      name: 'postponeEq',
      component: PostponeEq,
    },
  ],
})

export default router
