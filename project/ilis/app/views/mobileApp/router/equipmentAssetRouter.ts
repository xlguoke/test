// 固定资产
export default [

  {
    path: '/asset/detail/:id',
    name: 'assetDetail',
    meta: {
      title: '资产详情',
      scrollTop: 0,
      keepAlive: true,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/asset/detail/index.vue'),
  },
]
