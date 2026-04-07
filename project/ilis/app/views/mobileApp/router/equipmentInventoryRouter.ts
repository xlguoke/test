// 设备盘点
export default [
  {
    path: '/equipmentInventory',
    name: 'equipmentInventory',
    meta: {
      title: '设备盘点',
    },
    component: () => import('~/views/mobileApp/views/equipmentInventory/index.vue'),
  },
  {
    path: '/equipmentInventory/makeInventory',
    name: 'equipmentMakeInventory',
    meta: {
      title: '盘点登记',
    },
    component: () => import('~/views/mobileApp/views/equipmentInventory/makeInventory/index.vue'),
  },
  {
    path: '/equipmentInventory/detail',
    name: 'equipmentInventoryDetail',
    meta: {
      title: '盘点详情',
    },
    component: () => import('~/views/mobileApp/views/equipmentInventory/detail/index.vue'),
  },
]
