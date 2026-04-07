// 设备综合管理
export default [
  {
    path: '/equipment',
    name: 'equipment',
    meta: {
      title: '设备列表',
      keepAlive: true,
      scrollTop: 0,
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/equipment/index.vue'),
  },
  // 设备详情
  {
    path: '/equipment/detail/:id',
    name: 'equipmentDetail',
    meta: {
      title: '设备详情',
      keepAlive: true,
      scrollTop: 0,
      resetPage: null,
      reloadUseRcord: false,
      functionCode: 'mobile_equipmentUseRegister,mobile_equipmentGoOutDetail',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentDetail/index.vue'),
  },
  // 设备使用登记
  {
    path: '/equipment/useRecord',
    name: 'equipmentUseRecord',
    meta: {
      title: '设备使用登记',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentUseRecord/index.vue'),
  },
  // 设备使用记录
  {
    path: '/equipment/equipmentRecordsList',
    name: 'equipmentRecordsList',
    meta: {
      title: '设备使用记录',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentRecordsList/index.vue'),
  },
  // 设备扫描登记
  {
    path: '/equipment/scanRegistration',
    name: 'scanRegistration',
    meta: {
      title: '设备使用登记',
    },
    component: () => import('~/views/mobileApp/views/equipment/scanRegistration/index.vue'),
  },
  // 设备外出管理列表
  {
    path: '/equipment/goOutManage',
    name: 'equipmentGoOut',
    meta: {
      title: '设备出入库管理',
      keepAlive: true,
      scrollTop: 0,
      resetPage: null,
      resetList: null,
      functionCode: 'mobile_equipmentEgress,mobile_equipmentEgressConfirm,mobile_equipmentReturn,mobile_equipmentReturnConfirm,mobile_equipmentHandOver,mobile_equipmentHandOverAudit,mobile_equipmentHandOverReceive',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentGoOut/index.vue'),
  },
  // 设备外出管理
  {
    path: '/equipment/goOutDetail/:id',
    name: 'equipmentGoOutDetail',
    meta: {
      title: '设备外出详情',
      functionCode: 'mobile_equipmentEgress,mobile_equipmentEgressConfirm,mobile_equipmentReturn,mobile_equipmentReturnConfirm,mobile_equipmentPostpone,mobile_equipmentDeferredConfirmation,mobile_equipmentDeferredReject,mobile_equipmentEgressEdit,mobile_equipmentConfirmEdit,mobile_equipmentHandOver,mobile_equipmentHandOverAudit,mobile_equipmentHandOverReceive',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentGoOut/detail/index.vue'),
  },
  // 新增设备外出
  {
    path: '/equipment/addWarehouseOut/:id',
    name: 'addWarehouseOut',
    meta: {
      title: '新增设备外出',
    },
    component: () =>
      import('~/views/mobileApp/views/equipment/equipmentGoOut/detail/addWarehouseOut.vue'),
  },
  {
    path: '/equipment/postponeEq/:id',
    name: 'postponeEq',
    meta: {
      title: '设备延期',
    },
    component: () =>
      import('~/views/mobileApp/views/equipment/equipmentGoOut/detail/postponeEq.vue'),
  },
  // 处理设备外出
  {
    path: '/equipment/warehouseOutDispose/:id/:status',
    name: 'warehouseOutDispose',
    meta: {
      title: '设备出库处理',
      updateBefore: null,
    },
    component: () =>
      import('~/views/mobileApp/views/equipment/equipmentGoOut/detail/warehouseOutDispose.vue'),
  },
  // 设备转交申请
  {
    path: '/equipment/handOverApply/:id',
    name: 'handOverApply',
    meta: {
      title: '设备转交申请',
    },
    component: () =>
      import('~/views/mobileApp/views/equipment/equipmentGoOut/detail/handOverApply.vue'),
  },
  // 设备批量出入库操作
  {
    path: '/equipment/equipmentScanAdd/:status/:name',
    name: 'equipmentScanAdd',
    meta: {
      title: '设备批量操作',
      keepAlive: true,
      scrollTop: 0,
      resetList: null,
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentScanAdd/index.vue'),
  },
  // 设备位置上报
  {
    path: '/equipment/equipmentLocationReported',
    name: 'equipmentLocationReported',
    meta: {
      title: '位置上报',
      functionCode: 'mobile_equipmentLocationReported',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentLocationReported/index.vue'),
  },
  // 设备维修列表
  {
    path: '/equipment/equipmentRepairList',
    name: 'equipmentRepairList',
    meta: {
      title: '设备维修',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentRepairList/index.vue'),
  },
  // 设备使用登记
  {
    path: '/equipment/equipmentRepairAdd',
    name: 'equipmentRepairAdd',
    meta: {
      title: '设备维修',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentRepairAdd/index.vue'),
  },
  {
    path: '/equipment/equipmentCheckConfirm',
    name: 'equipmentCheckConfirm',
    meta: {
      title: '检校确认',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentCheckConfirm/index.vue'),
  },
  {
    path: '/equipment/equipmentCheckConfirm/add/:id?',
    name: 'equipmentCheckConfirmAdd',
    meta: {
      title: '创建检校确认',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentCheckConfirm/add.vue'),
  },
  {
    path: '/equipment/equipmentCheckConfirm/addBySend',
    name: 'equipmentCheckConfirmAddBySend',
    meta: {
      title: '通过送检登记创建检校确认',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentCheckConfirm/addByCheckSend.vue'),
  },
  {
    path: '/equipment/equipmentCheckConfirm/selectCheckSendDevice',
    name: 'selectCheckSendDevice',
    meta: {
      title: '选择送检设备',
    },
    component: () => import('~/views/mobileApp/views/equipment/equipmentCheckConfirm/selectCheckSendDevice.vue'),
  },
]
