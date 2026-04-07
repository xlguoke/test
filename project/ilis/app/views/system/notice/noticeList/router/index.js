import * as VueRouter from 'vue-router'

// 列表页
import list from '../list/index.vue'
import model from '../list/model.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
    },
    {
      path: '/noticeDetail',
      name: 'noticeDetail',
      component: model,
    },
  ],
})

export default router
