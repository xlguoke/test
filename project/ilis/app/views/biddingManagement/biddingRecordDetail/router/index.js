import * as VueRouter from 'vue-router'

// 附件
import Accessories from '../accessories/index.vue'
// 详情页
import Detail from '../detail/index.vue'
// 本单位
import Mine from '../mine/index.vue'
// 其他单位
import Other from '../other/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Detail',
      component: Detail,
      children: [
        {
          path: '',
          component: Mine,
        },
        {
          path: 'Other',
          component: Other,
        },
        {
          path: 'Accessories',
          component: Accessories,
        },
      ],
    },
  ],
})

export default router
