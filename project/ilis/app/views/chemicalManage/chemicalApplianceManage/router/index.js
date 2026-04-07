import * as VueRouter from 'vue-router'

// 参数关联化学品
import associatedChemical from '../associatedChemical/index.vue'
// 库存管理
import inventoryManage from '../inventoryManage/index.vue'
// 库存统计
import inventoryStatistics from '../inventoryStatistics/index.vue'
// 级别管理
import levelManage from '../levelManage/index.vue'
// 溶液配置
import liquorManage from '../liquorManage/index.vue'
// 化学品名称管理
import nameManage from '../nameManage/index.vue'
// 出库管理
import stockOutRegister from '../stockOutRegister/index.vue'

// 入库管理
import storageManage from '../storageManage/index.vue'

// 化学品使用登记
import useRegistration from '../useRegistration/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/useRegistration',
      name: 'useRegistration',
      component: useRegistration,
    },
    {
      path: '/associatedChemical',
      name: 'associatedChemical',
      component: associatedChemical,
    },
    {
      path: '/nameManage',
      name: 'nameManage',
      component: nameManage,
    },
    {
      path: '/levelManage',
      name: 'levelManage',
      component: levelManage,
    },
    {
      path: '/liquorManage',
      name: 'liquorManage',
      component: liquorManage,
    },
    {
      path: '/inventoryStatistics',
      name: 'inventoryStatistics',
      component: inventoryStatistics,
    },
    {
      path: '/inventoryManage',
      name: 'inventoryManage',
      component: inventoryManage,
    },
    {
      path: '/storageManage',
      name: 'storageManage',
      component: storageManage,
      meta: {
        title: '入库管理',
      },
    },
    {
      path: '/stockOutRegister',
      name: 'stockOutRegister',
      component: stockOutRegister,
      meta: {
        title: '出库登记',
      },
    },
  ],
})

export default router
