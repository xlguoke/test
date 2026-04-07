import type { RouteRecordRaw } from 'vue-router'

const chemicalRouter: RouteRecordRaw[] = [
  // 采购登记
  {
    path: '/chemical/purchase',
    name: 'chemicalPurchase',
    meta: {
      title: '采购登记',
      functionCode: 'mobile_chemicalPurchase',
    },
    component: () => import('~/views/mobileApp/views/chemical/purchase/index.vue'),
  },
  // 采购登记 - 新增
  {
    path: '/chemical/purchase/add',
    name: 'chemicalPurchaseAdd',
    meta: {
      title: '新增采购登记',
      functionCode: 'mobile_chemicalPurchase',
    },
    component: () => import('~/views/mobileApp/views/chemical/purchase/add/index.vue'),
  },
  // 采购登记 - 化学品选择
  {
    path: '/chemical/purchase/add/selector',
    name: 'chemicalPurchaseSelector',
    meta: {
      title: '选择化学品',
      functionCode: 'mobile_chemicalPurchase',
    },
    component: () => import('~/views/mobileApp/views/chemical/commonSelector/chemical-apply-selector.vue'),
  },
  // 采购登记 - 详情
  {
    path: '/chemical/purchase/detail/:id',
    name: 'chemicalPurchaseDetail',
    meta: {
      title: '登记详情',
      functionCode: 'mobile_chemicalPurchase',
    },
    component: () => import('~/views/mobileApp/views/chemical/purchase/detail/index.vue'),
  },
  // 验收登记
  {
    path: '/chemical/acceptance',
    name: 'chemicalAcceptance',
    meta: {
      title: '验收登记',
      functionCode: 'mobile_chemicalAcceptance',
    },
    component: () => import('~/views/mobileApp/views/chemical/acceptance/index.vue'),
  },
  // 验收登记 - 新增
  {
    path: '/chemical/acceptance/add',
    name: 'chemicalAcceptanceAdd',
    meta: {
      title: '新增验收登记',
      functionCode: 'mobile_chemicalAcceptance',
    },
    component: () => import('~/views/mobileApp/views/chemical/acceptance/add/index.vue'),
  },
  // 验收登记 - 编辑
  {
    path: '/chemical/acceptance/edit/:id',
    name: 'chemicalAcceptanceEdit',
    meta: {
      title: '编辑验收登记',
      functionCode: 'mobile_chemicalAcceptance',
    },
    component: () => import('~/views/mobileApp/views/chemical/acceptance/add/index.vue'),
  },
  // 验收登记 - 验收
  {
    path: '/chemical/acceptance/verify/:id',
    name: 'chemicalAcceptanceVerify',
    meta: {
      title: '验收',
      functionCode: 'mobile_chemicalAcceptance',
    },
    component: () => import('~/views/mobileApp/views/chemical/acceptance/verify/index.vue'),
  },
  // 验收登记 - 日志
  {
    path: '/chemical/acceptance/log/:id',
    name: 'chemicalAcceptanceLog',
    meta: {
      title: '日志',
      functionCode: 'mobile_chemicalAcceptance',
    },
    component: () => import('~/views/mobileApp/views/chemical/acceptance/log/index.vue'),
  },
  // 入库登记
  {
    path: '/chemical/storage-in',
    name: 'chemicalStorageIn',
    meta: {
      title: '入库登记',
      functionCode: 'mobile_chemicalStorageIn',
    },
    component: () => import('~/views/mobileApp/views/chemical/storage-in/index.vue'),
  },
  // 入库登记 - 采购新增
  {
    path: '/chemical/storage-in/add',
    name: 'chemicalStorageInAdd',
    meta: {
      title: '采购新增',
      functionCode: 'mobile_chemicalStorageIn',
    },
    component: () => import('~/views/mobileApp/views/chemical/storage-in/add/index.vue'),
  },
  // 入库登记 - 按采购申请新增
  {
    path: '/chemical/storage-in/apply-add',
    name: 'chemicalStorageInApplyAdd',
    meta: {
      title: '按采购申请新增',
      functionCode: 'mobile_chemicalStorageIn',
    },
    component: () => import('~/views/mobileApp/views/chemical/storage-in/apply-add/index.vue'),
  },
  // 入库登记 - 编辑
  {
    path: '/chemical/storage-in/edit/:id',
    name: 'chemicalStorageInEdit',
    meta: {
      title: '编辑入库登记',
      functionCode: 'mobile_chemicalStorageIn',
    },
    component: () => import('~/views/mobileApp/views/chemical/storage-in/add/index.vue'),
  },
  // 出库登记
  {
    path: '/chemical/storage-out',
    name: 'chemicalStorageOut',
    meta: {
      title: '出库登记',
      functionCode: 'mobile_chemicalStorageOut',
    },
    component: () => import('~/views/mobileApp/views/chemical/storage-out/index.vue'),
  },
  // 新增出库
  {
    path: '/chemical/storage-out/add',
    name: 'chemicalStorageOutAdd',
    meta: {
      title: '新增出库',
      functionCode: 'mobile_chemicalStorageOut',
    },
    component: () => import('~/views/mobileApp/views/chemical/storage-out/add/index.vue'),
  },
  // 编辑出库
  {
    path: '/chemical/storage-out/edit/:id',
    name: 'chemicalStorageOutEdit',
    meta: {
      title: '编辑出库',
      functionCode: 'mobile_chemicalStorageOut',
    },
    component: () => import('~/views/mobileApp/views/chemical/storage-out/add/index.vue'),
  },
  // 返还入库
  {
    path: '/chemical/storage-out/return/:id',
    name: 'chemicalStorageOutReturn',
    meta: {
      title: '返还入库',
      functionCode: 'mobile_chemicalStorageOut',
    },
    component: () => import('~/views/mobileApp/views/chemical/storage-out/return/index.vue'),
  },
  // 使用登记
  {
    path: '/chemical/use-registration',
    name: 'chemicalUseRegistration',
    meta: {
      title: '使用登记',
      functionCode: 'mobile_chemicalUsage',
    },
    component: () => import('~/views/mobileApp/views/chemical/use-registration/index.vue'),
  },
  // 使用登记 - 新增
  {
    path: '/chemical/use-registration/add',
    name: 'chemicalUseRegistrationAdd',
    meta: {
      title: '新增使用登记',
      functionCode: 'mobile_chemicalUsage',
    },
    component: () => import('~/views/mobileApp/views/chemical/use-registration/add/index.vue'),
  },
  // 使用登记 - 使用记录
  {
    path: '/chemical/use-registration/use-record',
    name: 'chemicalUseRegistrationRecord',
    meta: {
      title: '使用记录',
      functionCode: 'mobile_chemicalUsage',
    },
    component: () => import('~/views/mobileApp/views/chemical/use-registration/use-record/index.vue'),
  },
  // 使用登记 - 出入库记录
  {
    path: '/chemical/use-registration/storage-record',
    name: 'chemicalUseRegistrationStorageRecord',
    meta: {
      title: '出入库记录',
      functionCode: 'mobile_chemicalUsage',
    },
    component: () => import('~/views/mobileApp/views/chemical/use-registration/storage-record/index.vue'),
  },
  // 实时库存
  {
    path: '/chemical/inventory',
    name: 'chemicalInventory',
    meta: {
      title: '实时库存',
      functionCode: 'mobile_chemicalInventory',
    },
    component: () => import('~/views/mobileApp/views/chemical/inventory/index.vue'),
  },
  // 实时库存 - 日志
  {
    path: '/chemical/inventory/log',
    name: 'chemicalInventoryLog',
    meta: {
      title: '日志',
      functionCode: 'mobile_chemicalInventory',
    },
    component: () => import('~/views/mobileApp/views/chemical/inventory/log/index.vue'),
  },
  // 化学品存量
  {
    path: '/chemical/stock',
    name: 'chemicalStock',
    meta: {
      title: '化学品存量',
      functionCode: 'mobile_chemicalStock',
    },
    component: () => import('~/views/mobileApp/views/chemical/stock/index.vue'),
  },
  // 化学品存量 - 详情
  {
    path: '/chemical/stock/detail',
    name: 'chemicalStockDetail',
    meta: {
      title: '化学品存量详情',
      functionCode: 'mobile_chemicalStock',
    },
    component: () => import('~/views/mobileApp/views/chemical/stock/detail/index.vue'),
  },
  // 化学品存量 - 出入库记录
  {
    path: '/chemical/stock/record',
    name: 'chemicalStockRecord',
    meta: {
      title: '出入库记录',
      functionCode: 'mobile_chemicalStock',
    },
    component: () => import('~/views/mobileApp/views/chemical/stock/record/index.vue'),
  },
]

export default chemicalRouter
