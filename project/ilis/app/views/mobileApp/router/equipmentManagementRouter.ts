// 设备综合管理
export default [
  {
    path: '/equipmentManagement',
    name: 'equipmentManagement',
    meta: {
      title: '设备列表',
    },
    component: () => import('~/views/mobileApp/views/equipmentManagement/index.vue'),
  },
  // 设备详情
  {
    path: '/equipmentManagement/detail/:id',
    name: 'equipmentManagementDetail',
    meta: {
      title: '设备详情',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
      reloadUseRcord: false,
      functionCode: 'mobile_equipmentUseRegister,mobile_equipmentGoOutDetail',
    },
    component: () => import('~/views/mobileApp/views/equipmentManagement/equipmentDetail/index.vue'),
  },
]
