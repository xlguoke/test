import * as VueRouter from 'vue-router'

// 业务项目管理详情页 - 检测报告
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
  ],
})

export default router
