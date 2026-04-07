// 样品流转

export default [
  {
    path: '/samples',
    name: 'samples',
    meta: {
      title: '样品流转',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
    },
    component: () => import('~/views/mobileApp/views/samples/index.vue'),
  },
  // 现场取样-选择样品类型
  {
    path: '/samples/samplesSelect',
    name: 'samplesSelect',
    meta: {
      title: '现场取样',
    },
    component: () => import('~/views/mobileApp/views/samples/samplesSelect/index.vue'),
  },
  // 现场取样
  {
    path: '/samples/fieldSampling',
    name: 'fieldSampling',
    meta: {
      title: '现场取样',
    },
    component: () => import('~/views/mobileApp/views/samples/fieldSampling/index.vue'),
  },
  // 样品详情
  {
    path: '/samples/sampleInfo',
    name: 'sampleInfo',
    meta: {
      title: '样品详情',
    },
    component: () => import('~/views/mobileApp/views/samples/sampleInfo/index.vue'),
  },
  // 样品编号生成
  {
    path: '/samples/sampleCodeGeneration/:type/:extractSampleId/:pageFrom?',
    name: 'sampleCodeGeneration',
    meta: {
      title: '样品编号生成',
    },
    component: () => import('~/views/mobileApp/views/samples/sampleCodeGeneration/index.vue'),
  },
  // 样品入库
  {
    path: '/samples/sampleStorage',
    name: 'sampleStorage',
    meta: {
      title: '样品入库',
    },
    component: () => import('~/views/mobileApp/views/samples/sampleStorage/index.vue'),
  },
  // 样品入库
  {
    path: '/samples/sampleStorageRecord',
    name: 'sampleStorageRecord',
    meta: {
      title: '样品入库',
    },
    component: () => import('~/views/mobileApp/views/samples/sampleStorageRecord/index.vue'),
  },
  // 样品入库-手动录入
  {
    path: '/samples/sampleInput',
    name: 'sampleInput',
    meta: {
      title: '录入编码',
    },
    component: () => import('~/views/mobileApp/views/samples/sampleInput/index.vue'),
  },
  // 详情页
  {
    path: '/samples/detail/:id',
    name: 'sampleDetail',
    meta: {
      title: '样品信息',
      functionCode: 'mobile_receiveSample,mobile_subpackageSample,mobile_completeTest,mobile_sampleHandle',
    },
    component: () => import('~/views/mobileApp/views/samples/sampleDetail/index.vue'),
  },
  // 领取样品
  {
    path: '/samples/receiveTestSample/:id',
    name: 'receiveTestSample',
    meta: {
      title: '领取检测样品',
    },
    component: () =>
      import('~/views/mobileApp/views/samples/sampleDetail/components/receiveTest.vue'),
  },
  // 分包样品
  {
    path: '/samples/subpackage/:id',
    name: 'subpackage',
    meta: {
      title: '分包样品',
    },
    component: () =>
      import('~/views/mobileApp/views/samples/sampleDetail/components/subpackage.vue'),
  },
  // 测后样品处理
  {
    path: '/samples/handleSample/:id',
    name: 'handleSample',
    meta: {
      title: '测后样品处理',
    },
    component: () =>
      import('~/views/mobileApp/views/samples/sampleDetail/components/handleSample.vue'),
  },
  // 留样提前处理
  {
    path: '/samples/earlyHandle/:id',
    name: 'earlyHandle',
    meta: {
      title: '留样提前处理',
    },
    component: () =>
      import('~/views/mobileApp/views/samples/sampleDetail/components/earlyHandle.vue'),
  },
  // 留样到期处理
  {
    path: '/samples/expireHandle/:id/:early?',
    name: 'expireHandle',
    meta: {
      title: '留样到期处理',
    },
    component: () =>
      import('~/views/mobileApp/views/samples/sampleDetail/components/expireHandle.vue'),
  },
  // 标养出入库管理
  {
    path: '/samples/standardCuringPeriods',
    name: 'standardCuringPeriods',
    meta: {
      title: '试件列表',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
      functionCode: 'mobile_standardStorageEnter,mobile_standardStorageOut',
    },
    component: () =>
      import('~/views/mobileApp/views/samples/standardCuringPeriods/index.vue'),
  },
  // 标养出入库
  {
    path: '/samples/standardCuringStorage/:type',
    name: 'standardCuringStorage',
    meta: {
      title: '标养室出入库',
    },
    component: () =>
      import(
        '~/views/mobileApp/views/samples/standardCuringPeriods/standardCuringStorage.vue',
      ),
  },
]
