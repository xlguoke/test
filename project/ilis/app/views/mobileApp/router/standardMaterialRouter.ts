import type { RouteRecordRaw } from 'vue-router'

const standardMaterialRouter: RouteRecordRaw[] = [
  {
    path: '/standardMaterial/list',
    name: 'standardMaterialList',
    meta: {
      title: '标准物质管理',
      functionCode: 'mobile_standardMaterial',
    },
    component: () => import('~/views/mobileApp/views/standardMaterial/list/index.vue'),
  },
  {
    path: '/standardMaterial/detail',
    name: 'standardMaterialDetail',
    meta: {
      title: '标准物质详情',
      functionCode: 'mobile_standardMaterial',
    },
    component: () => import('~/views/mobileApp/views/standardMaterial/detail/index.vue'),
  },
  {
    path: '/standardMaterial/inbound',
    name: 'standardMaterialInbound',
    meta: {
      title: '入库登记',
      functionCode: 'mobile_standardMaterial',
    },
    component: () => import('~/views/mobileApp/views/standardMaterial/inbound/index.vue'),
  },
  {
    path: '/standardMaterial/outbound',
    name: 'standardMaterialOutbound',
    meta: {
      title: '出库登记',
      functionCode: 'mobile_standardMaterial',
    },
    component: () => import('~/views/mobileApp/views/standardMaterial/outbound/index.vue'),
  },
]

export default standardMaterialRouter
