// 设备综合管理
export default [
  {
    path: '/equipmentCallin',
    name: 'equipmentCallin',
    meta: {
      title: '设备列表',
    },
    component: () => import('~/views/mobileApp/views/equipmentCallin/index.vue'),
  },
  // 设备详情
  {
    path: '/equipmentCallin/detail/:id',
    name: 'equipmentCallinDetail',
    meta: {
      title: '设备调拨记录',
      functionCode: 'mobile_equipmentUseRegister,mobile_equipmentGoOutDetail',
    },
    component: () => import('~/views/mobileApp/views/equipmentCallin/equipmentDetail/index.vue'),
  },
  {
    path: '/equipmentCallinForm/:id',
    name: 'equipmentCallinForm',
    meta: {
      title: '设备调入',
    },
    component: () => import('~/views/mobileApp/views/equipmentCallin/equipmentCallinForm/index.vue'),
  },

]
