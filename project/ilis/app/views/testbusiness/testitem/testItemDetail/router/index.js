import * as VueRouter from 'vue-router'

// 业务项目管理详情页 - 附录
import Appendix from '../appendix/index.vue'
// 业务项目管理详情页 - 归档管理
import Archive from '../archive-manage/Index.vue'
// 业务项目管理详情页 - 联系人
import Contacts from '../contacts/index.vue'
// 业务项目管理详情页 - 合同段/工程划分
import ContractAndWorks from '../contractAndWorks/index.vue'
// 业务项目管理详情页 - 检测方案及成果
import OtherAchievement from '../otherAchievement/index.vue'
// 业务项目管理详情页 - 进度管理
import ProgressManage from '../progressManage/index.vue'
// 业务项目管理详情页
import ProjectDetail from '../projectDetail/index.vue'

// 创建综合试验选择单位工程
import SelTreeUnit from '../testReport/components/selTree.vue'
// 业务项目管理详情页 - 检测报告
import TestReport from '../testReport/index.vue'

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
          component: TestReport,
          meta: {
            functionCode: 'set:person,create:task,del:report,see-log',
          },
        },
        {
          path: 'otherAchievement',
          component: OtherAchievement,
          meta: {
            functionCode: 'add:achieve,edit:achieve,del:achieve,set:person',
          },
        },
        {
          path: 'appendix',
          component: Appendix,
          meta: {
            functionCode: 'add:attach,del:attach,edit:attach,set:person',
          },
        },
        {
          path: 'contractAndWorks',
          component: ContractAndWorks,
          meta: {
            functionCode:
              'add:unit,edit:unit,del:unit,set:workers,add:contract,edit:contract,del:contract,add:contact,edit:contact,del:contact,set:person',
          },
        },
        {
          path: 'progressManage',
          component: ProgressManage,
          meta: {
            functionCode:
              'add:progress:column,update:progress,edit:progress:column,del:progress:column,set:person',
          },
        },
        {
          path: 'Contacts',
          component: Contacts,
          meta: {
            functionCode: 'add:contact,edit:contact,del:contact,set:person',
          },
        },
        {
          path: 'archiveManage',
          component: Archive,
        },
      ],
    },
    {
      path: '/selTreeUnit',
      name: 'SelTreeUnit',
      component: SelTreeUnit,
      meta: {
        functionCode: '',
      },
    },
  ],
})

export default router
