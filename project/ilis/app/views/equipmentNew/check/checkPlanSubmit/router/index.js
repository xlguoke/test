import * as VueRouter from 'vue-router'

// 列表页
import From from '../from/index.vue'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'from',
      component: From,
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
