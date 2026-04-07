// 我的
export default [
  {
    path: '/setting',
    name: 'setting',
    meta: {
      title: '我的',
    },
    component: () => import('~/views/mobileApp/views/setting/index.vue'),
  },
  {
    path: '/setting/baseInfo',
    name: 'settingBaseInfo',
    meta: {
      title: '基本信息设置',
    },
    component: () => import('~/views/mobileApp/views/setting/settingBaseInfo/index.vue'),
  },
  {

    path: '/setting/personnelInfo',
    name: 'personnelInfo',
    meta: {
      title: '人员信息',
    },
    component: () => import('~/views/mobileApp/views/setting/personnelInfo/index.vue'),

  },
  {
    path: '/setting/password',
    name: 'changePassword',
    meta: {
      title: '安全设置',
    },
    component: () => import('~/views/mobileApp/views/setting/password/index.vue'),
  },
  {
    path: '/setting/notice',
    name: 'settingNotice',
    meta: {
      title: '消息设置',
    },
    component: () => import('~/views/mobileApp/views/setting/settingNotice/index.vue'),
  },
  {
    path: '/setting/aboutUs',
    name: 'settingAboutUs',
    meta: {
      title: '关于',
    },
    component: () => import('~/views/mobileApp/views/setting/aboutUs/index.vue'),
  },
]
