// 设备综合管理
export default [
  {
    path: '/equipmentCallout',
    name: 'equipmentCallout',
    meta: {
      title: '设备列表',
    },
    component: () => import('~/views/mobileApp/views/equipmentCallout/index.vue'),
  },
  // 设备详情
  {
    path: '/equipmentCallout/detail/:id',
    name: 'equipmentCalloutDetail',
    meta: {
      title: '设备调拨记录',
      functionCode: 'mobile_equipmentUseRegister,mobile_equipmentGoOutDetail',
    },
    component: () => import('~/views/mobileApp/views/equipmentCallout/equipmentDetail/index.vue'),
  },

]
