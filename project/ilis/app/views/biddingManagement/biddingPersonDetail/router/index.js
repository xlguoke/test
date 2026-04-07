import * as VueRouter from 'vue-router'

// 人员附件
import Accessories from '../accessories/index.vue'
// 继续教育登记
import AdultEducation from '../adultEducation/index.vue'
// 人员证书
import Certificate from '../certificate/index.vue'
// 详情页
import Detail from '../detail/index.vue'
// 人员业绩
import Performance from '../performance/index.vue'
// 招投标引用记录
import ReferenceRecord from '../referenceRecord/index.vue'
// 工作记录
import WorkRecord from '../workRecord/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: Detail,
      children: [
        {
          path: '',
          component: WorkRecord,
        },
        {
          path: 'Certificate',
          component: Certificate,
        },
        {
          path: 'AdultEducation',
          component: AdultEducation,
        },
        {
          path: 'Performance',
          component: Performance,
        },
        {
          path: 'ReferenceRecord',
          component: ReferenceRecord,
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
