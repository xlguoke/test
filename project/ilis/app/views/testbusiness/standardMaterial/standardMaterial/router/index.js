import * as VueRouter from 'vue-router'

import List from '../list/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'List',
      component: List,
      meta: {
        functionCode:
          'standardMaterialExport,standardMaterialImport,standardMaterialInout',
      },
    },
  ],
})

export default router
