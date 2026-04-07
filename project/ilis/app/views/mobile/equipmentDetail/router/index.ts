import * as VueRouter from 'vue-router'

import eqDetNotLogin from '~/views/mobile/eqDetNotLogin/list/index.vue'
import add from '../add/index.vue'
// 详情
import detail from '../detail/index.vue'
import dispose from '../dispose/index.vue'
// 列表页
import list from '../list/index.vue'
import postponeEq from '../postponeEq/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/list',
      name: 'list',
      component: list,
    },
    {
      path: '/',
      name: 'detail',
      component: detail,
    },
    {
      path: '/add/:unitCode/:isLogin?',
      name: 'add',
      component: add,
    },
    {
      path: '/dispose/:id/:status/:isLogin?',
      name: 'dispose',
      component: dispose,
    },
    {
      path: '/eqDetail',
      name: 'eqDetail',
      component: eqDetNotLogin,
    },
    {
      path: '/postponeEq/:id/:status/:isLogin?',
      name: 'postponeEq',
      component: postponeEq,
    },
  ],
})

export default router
