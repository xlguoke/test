import type { RouteRecordRaw } from 'vue-router'

const standardMaterialAcceptRouter: RouteRecordRaw[] = [
  {
    path: '/standardMaterialAccept/list',
    name: 'standardMaterialAcceptList',
    meta: {
      title: '标准物质验收',
      functionCode: 'mobile_standardMaterialAccept',
    },
    component: () => import('~/views/mobileApp/views/standardMaterialAccept/list/index.vue'),
  },
  {
    path: '/standardMaterialAccept/detail',
    name: 'standardMaterialAcceptDetail',
    meta: {
      title: '购置验收详情',
      functionCode: 'mobile_standardMaterialAccept',
    },
    component: () => import('~/views/mobileApp/views/standardMaterialAccept/detail/index.vue'),
  },
  {
    path: '/standardMaterialAccept/add',
    name: 'standardMaterialAcceptAdd',
    meta: {
      title: '新增购置验收',
      functionCode: 'mobile_standardMaterialAccept',
    },
    component: () => import('~/views/mobileApp/views/standardMaterialAccept/add/index.vue'),
  },
]

export default standardMaterialAcceptRouter
