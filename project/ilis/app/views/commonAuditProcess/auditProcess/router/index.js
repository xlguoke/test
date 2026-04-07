import * as VueRouter from 'vue-router'
import ajax from '~/providers/common/ajax'
import list from '../list/index.vue'

// 流程审批页面

async function loginByToken() {
  const urlParam = new URLSearchParams(location.search)
  const unitCode = urlParam.get('UnitCode')
  const token = urlParam.get('htplat_token')
  try {
    const res = await ajax.get('/rest/common/decode64', {
      params: {
        raw: `UnitCode=${unitCode}`,
        htplat_token: `${token}`,
      },
    })
    if (res.code === 20000) {
      return res.data
    }
    throw res
  }
  catch (err) {
    console.error(err)
    return Promise.reject(new Error(err))
  }
}

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'list',
      component: list,
      meta: {
        functionCode: 'COMMON_PROCESS_AUDIT_BATCH',
      },
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

router.beforeEach(async () => {
  const htPartToken = sessionStorage.getItem('htPartToken')
  const isHtPlat = location.search.includes('htplat_token')
  if (isHtPlat && !htPartToken) {
    await loginByToken()
    sessionStorage.setItem('htPartToken', 1)
  }
})

export default router
