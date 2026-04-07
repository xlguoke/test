import * as VueRouter from 'vue-router'
import List from '../list/index.vue'

const codeStrTestItem
  = 'add:achieve,edit:achieve,del:achieve,set:person,add:attach,del:attach,edit:attach,set:person,'
const codeStr = 'detailFolderAdd,detailDataMark,detailDataUnMark,detailFolderUpdate,detailFolderDelete,detailTemplateQuote,detailItemAdd,detailItemAndCycleUpdate,detailItemAndCycleDelete,detailItemDataAdd,detailItemDataUpdate,detailItemDataDelete,'

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'List',
      component: List,
      meta: {
        functionCode: codeStrTestItem + codeStr,
      },
    },
  ],
})

export default router
