// 温湿度
export default [
  {
    path: '/temperature',
    name: 'temperature',
    meta: {
      title: '温湿度',
    },
    component: () => import('~/views/mobileApp/views/temperature/index.vue'),
  },
  // 实验室温湿度详情
  {
    path: '/temperatureDetail',
    name: 'temperatureDetail',
    meta: {
      title: '温湿度详情',
    },
    component: () => import('~/views/mobileApp/views/temperature/temperatureDetail/index.vue'),
  },
  // 报警记录
  {
    path: '/temperatureRecord',
    name: 'temperatureRecord',
    meta: {
      title: '报警记录',
    },
    component: () => import('~/views/mobileApp/views/temperature/temperatureRecord/index.vue'),
  },
]
