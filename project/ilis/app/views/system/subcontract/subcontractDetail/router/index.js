import * as VueRouter from 'vue-router'

// 详情页
import Detail from '../detail/index.vue'
// 本单位
import Mine from '../mine/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: Detail,
      children: [
        {
          path: '',
          component: Mine,
        },
      ],
    },
  ],
})

export default router
