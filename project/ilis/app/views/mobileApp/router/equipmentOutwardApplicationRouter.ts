// 设备盘点
export default [
  {
    path: '/equipmentOutwardApplication',
    name: 'equipmentOutwardApplication',
    meta: {
      title: '设备外出申请',
      functionCode: 'add::eqEgressApply,recall::eqEgressApply,submit::eqEgressApply',
    },
    component: () => import('~/views/mobileApp/views/equipmentOutwardApplication/index.vue'),
  },
  {
    path: '/equipmentOutwardApplication/edit/:id?/:status?',
    name: 'equipmentOutwardApplicationEdit',
    meta: {
      title: '设备外出申请编辑',
      functionCode: 'delete::eqEgressApply,recall::eqEgressApply,submit::eqEgressApply',
    },
    component: () => import('~/views/mobileApp/views/equipmentOutwardApplication/edit.vue'),
  },
  {
    path: '/equipmentOutwardApplication/log/:id?',
    name: 'equipmentOutwardApplicationLog',
    meta: {
      title: '设备外出申请日志',
    },
    component: () => import('~/views/mobileApp/views/equipmentOutwardApplication/log.vue'),
  },
]
