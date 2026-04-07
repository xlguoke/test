// 设备盘点
export default [
  {
    path: '/equipmentCheckSend',
    name: 'equipmentCheckSend',
    meta: {
      title: '设备送检登记',
      functionCode: '',
    },
    component: () => import('~/views/mobileApp/views/equipmentCheckSend/index.vue'),
  },
  {
    path: '/equipmentCheckSend/edit',
    name: 'equipmentCheckSendEdit',
    meta: {
      title: '设备送检登记编辑',
      functionCode: '',
    },
    component: () => import('~/views/mobileApp/views/equipmentCheckSend/edit.vue'),
  },
]
