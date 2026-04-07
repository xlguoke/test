import * as VueRouter from 'vue-router'

// 业务项目管理列表页
import ProjectManageList from '../projectManageList/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'ProjectManageList',
      component: ProjectManageList,
      meta: {
        functionCode: '',
      },
    },
  ],
})

export default router
