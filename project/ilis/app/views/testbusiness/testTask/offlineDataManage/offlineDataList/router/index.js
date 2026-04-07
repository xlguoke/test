import * as VueRouter from 'vue-router'

import ImportSetting from '../list/components/ImportSetting.vue'
// 列表页
import list from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
      meta: {
        functionCode:
          'offlineDataSeeAll,offlineDataCreateTask,offlineDataImportTask,offlineDataEditTask,offlineDataDeleteTask,offlineDataLog',
      },
    },
    {
      path: '/importSetting',
      name: 'importSetting',
      component: ImportSetting,
    },
    // {
    //   path: '/form',
    //   name: 'FormPage',
    //   component: FormPage,
    //   meta:{
    //     id: "4028822069c78f410169c7fcb26a0019",
    //     functionCode: "goConsignInfoPage,completeConsignById,consignCommonPrint1"
    //   }
    // }
  ],
})

export default router
