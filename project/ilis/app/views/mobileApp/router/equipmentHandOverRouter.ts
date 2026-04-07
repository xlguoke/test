// 设备综合管理
export default [
  {
    path: '/equipmentHandOver',
    name: 'equipmentHandOver',
    meta: {
      title: '设备列表',
    },
    component: () => import('~/views/mobileApp/views/equipmentHandOver/index.vue'),
  },
  // 设备详情
  {
    path: '/equipmentHandOver/detail/:id',
    name: 'equipmentHandOverDetail',
    meta: {
      title: '设备调拨记录',
      functionCode: 'mobile_equipmentUseRegister,mobile_equipmentGoOutDetail',
    },
    component: () => import('~/views/mobileApp/views/equipmentHandOver/equipmentDetail/index.vue'),
  },
  {
    path: '/equipmentHandOverForm/:id',
    name: 'equipmentHandOverForm',
    meta: {
      title: '设备移交',
    },
    component: () => import('~/views/mobileApp/views/equipmentHandOver/equipmentHandOverForm/index.vue'),
  },
  {
    path: '/equipmentInstallForm/:id',
    name: 'equipmentInstallForm',
    meta: {
      title: '设备安装',
    },
    component: () => import('~/views/mobileApp/views/equipmentHandOver/equipmentInstallForm/index.vue'),
  },

]
