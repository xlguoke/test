import * as VueRouter from 'vue-router'

// 添加制件样品
import addTest from '../detail/components/addTest.vue'
// 留样延期
import delay from '../detail/components/delay.vue'
// 留样提前处理
import earlyHandle from '../detail/components/earlyHandle.vue'
// 留样到期处理
import expireHandle from '../detail/components/expireHandle.vue'
// 测后样品处理
import handleSample from '../detail/components/handleSample.vue'
// 领取
import receiveTest from '../detail/components/receiveTest.vue'
// 详情页
import detail from '../detail/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'detail',
      component: detail,
    },
    {
      path: '/receiveTest/:id',
      name: 'receiveTest',
      component: receiveTest,
    },
    {
      path: '/addTest',
      name: 'addTest',
      component: addTest,
    },
    {
      path: '/handleSample/:id',
      name: 'handleSample',
      component: handleSample,
    },
    {
      path: '/delay',
      name: 'delay',
      component: delay,
    },
    {
      path: '/earlyHandle/:id',
      name: 'earlyHandle',
      component: earlyHandle,
    },
    {
      path: '/expireHandle/:id/:early?',
      name: 'expireHandle',
      component: expireHandle,
    },
  ],
})

export default router
