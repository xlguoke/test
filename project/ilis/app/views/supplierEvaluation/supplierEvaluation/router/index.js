import * as VueRouter from 'vue-router'

// 供应商评价配置页
import evaluateConfig from '../evaluateConfig/index.vue'
// 评价详情页 用于审核流程 查看详情
import evaluationDetail from '../evaluationDetail/index.vue'
// 供应商详情页
import supplierDetail from '../supplierDetail/index.vue'

// 供应商评价页
import supplierEvaluationList from '../supplierEvaluationList/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/supplierDetail',
      name: 'supplierDetail',
      component: supplierDetail,
    },
    {
      path: '/evaluationDetail',
      name: 'evaluationDetail',
      component: evaluationDetail,
    },
    {
      path: '/supplierEvaluationList',
      name: 'supplierEvaluationList',
      component: supplierEvaluationList,
    },
    {
      path: '/evaluateConfig',
      name: 'evaluateConfig',
      component: evaluateConfig,
      meta: {
        title: '供应商评价配置',
      },
    },
  ],
})

export default router
