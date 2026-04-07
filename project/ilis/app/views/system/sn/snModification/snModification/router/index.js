import * as VueRouter from 'vue-router'

// 委托编号 consign
import ConsignList from '../consignList/index.vue'
// 业务项目管理详情页
import ProjectDetail from '../projectDetail/index.vue'
// 样品编号 sample
import ProvideToCustomerSampleList from '../provideToCustomerSampleList/index.vue'
// 记录编号 record
import RecordList from '../recordList/index.vue'
// 报告编号 report
import ReportList from '../reportList/index.vue'
// 样品编号 sample
import SampleList from '../sampleList/index.vue'
// 任务编号 task
import TaskList from '../taskList/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'ProjectDetail',
      component: ProjectDetail,
      children: [
        {
          path: '',
          component: ConsignList,
          meta: {
            functionCode: '',
          },
        },
        {
          path: 'provideToCustomerSampleList',
          component: ProvideToCustomerSampleList,
          meta: {
            functionCode: '',
          },
        },
        {
          path: 'sampleList',
          component: SampleList,
          meta: {
            functionCode: '',
          },
        },
        {
          path: 'taskList',
          component: TaskList,
          meta: {
            functionCode: '',
          },
        },
        {
          path: 'recordList',
          component: RecordList,
          meta: {
            functionCode: '',
          },
        },
        {
          path: 'reportList',
          component: ReportList,
          meta: {
            functionCode: '',
          },
        },
      ],
    },
  ],
})

export default router
