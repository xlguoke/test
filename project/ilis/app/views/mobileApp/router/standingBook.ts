// 台账
export default [
  {
    path: '/standingBook',
    name: 'standingBook',
    meta: {
      title: '台账',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/standingBook/index.vue'),
  },
  // 样品出入库台账
  {
    path: '/samplesDelivery',
    name: 'samplesDelivery',
    meta: {
      title: '样品出入库台账',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/standingBook/samplesDelivery/index.vue'),
  },
  // 样品出入库台账详情
  {
    path: '/samplesDeliveryDetail',
    name: 'samplesDeliveryDetail',
    meta: {
      title: '样品出入库台账详情',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/standingBook/samplesDelivery/components/detail.vue'),
  },
  // 样品分包台账
  {
    path: '/samplesSubpackageDelivery',
    name: 'samplesSubpackageDelivery',
    meta: {
      title: '样品分包台账',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/standingBook/samplesSubpackageDelivery/index.vue'),
  },
  // 取样台账
  {
    path: '/sampling',
    name: 'sampling',
    meta: {
      title: '取样台账',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/standingBook/sampling/index.vue'),
  },
  // 标养台账
  {
    path: '/standardCuring',
    name: 'standardCuring',
    meta: {
      title: '标养台账',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/standingBook/standardCuring/index.vue'),
  },
  // 标养室出入库台账
  {
    path: '/standardCuringDelivery',
    name: 'standardCuringDelivery',
    meta: {
      title: '标养室出入库台账',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/standingBook/standardCuringDelivery/index.vue'),
  },
  // 标养室出入库台账详情
  {
    path: '/standardCuringDeliveryDetail',
    name: 'standardCuringDeliveryDetail',
    meta: {
      title: '标养室出入库台账',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/standingBook/standardCuringDelivery/components/detail.vue'),
  },
  // 设备外出台账
  {
    path: '/equipmentGoOutBook',
    name: 'equipmentGoOutBook',
    meta: {
      title: '设备外出台账',
    },
    component: () => import('~/views/mobileApp/views/standingBook/eqGoOutBook/index.vue'),
  },
  {
    path: '/equipmentGoOutBookDetail',
    name: 'equipmentGoOutBookDetail',
    meta: {
      title: '设备外出台账详情',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/standingBook/eqGoOutBook/components/detail.vue'),
  },
]
