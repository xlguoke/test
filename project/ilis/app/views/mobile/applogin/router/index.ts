import * as VueRouter from 'vue-router'

// 登录页
import login from '../login/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: login,
    },
  ],
})

export default router
