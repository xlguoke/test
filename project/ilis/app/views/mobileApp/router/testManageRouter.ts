// 试验管理  testManage
export default [
  {
    path: '/testManage/taskAssigned', // testTask reportAudit
    name: 'taskAssigned',
    meta: {
      title: '任务分配',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
      functionCode: '',
    },
    component: () => import('~/views/mobileApp/views/testManage/taskAssigned/index.vue'),
  },
  {
    path: '/testManage/testTask', // testTask reportAudit
    name: 'testTask',
    meta: {
      title: '试验任务',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
      functionCode: 'mobile_allTestData,mobile_reservationLab,mobile_sampleSend',
    },
    component: () => import('~/views/mobileApp/views/testManage/testTask/index.vue'),
  },
  {
    path: '/testManage/reservationLab',
    name: 'reservationLab',
    meta: {
      title: '预约功能室',
    },
    component: () => import('~/views/mobileApp/views/testManage/reservationLab/index.vue'),
  },
  {
    path: '/testManage/sampleSend',
    name: 'sampleSend',
    meta: {
      title: '新增智能送样',
    },
    component: () => import('~/views/mobileApp/views/testManage/sampleSend/index.vue'),
  },
  {
    path: '/testManage/testTask/detail', // testTask reportAudit
    name: 'testTaskDetail',
    meta: {
      title: '任务详情',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/testManage/testTask/components/Detail.vue'),
  },
  {
    path: '/testManage/testTask/scanResult', // testTask reportAudit
    name: 'testTaskScanResult',
    meta: {
      title: '扫码选择', // 扫码选择及扫码结果展示
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/testManage/testTask/components/ScanResult.vue'),
  },
  {
    path: '/testManage/unqualifiedTest',
    name: 'unqualifiedTest',
    meta: {
      title: '不合格试验',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
      functionCode: '',
    },
    component: () => import('~/views/mobileApp/views/testManage/unqualifiedTest/index.vue'),
  },
  // 不合格台账详情
  {
    path: '/testManage/unqualifiedTestDetail/:taskId',
    name: 'unqualifiedTestDetail',
    meta: {
      title: '不合格台账详情',
      keepAlive: true,
      scrollTop: 0,
      resetPage: null,
      reloadUseRcord: false,
    },
    component: () => import('~/views/mobileApp/views/testManage/unqualifiedTestDetail/index.vue'),
  },
  {
    path: '/testManage/taskAssignedDetail/:id',
    name: 'taskAssignedDetail',
    meta: {
      title: '任务详情',
    },
    component: () => import('~/views/mobileApp/views/testManage/taskAssignedDetail/index.vue'),
  },
  {
    path: '/testManage/allotByObject/:id',
    name: 'allotByObject',
    meta: {
      title: '任务分配',
    },
    component: () =>
      import('~/views/mobileApp/views/testManage/components/allotByObject/index.vue'),
  },
  {
    path: '/testManage/standard',
    name: 'standard',
    meta: {
      title: '规程查询',
    },
    component: () =>
      import('~/views/mobileApp/views/testManage/standardView/index.vue'),
  },

]
