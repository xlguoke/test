import type { RouteRecordRaw } from 'vue-router'

//  底部导航
const navRoutes: RouteRecordRaw[] = [
  {
    name: 'Home',
    path: '/home',
    component: () => import('@/views/home/Home.vue'),
    meta: {
      title: '首页',
      keepAlive: false,
      icon: 'icon-shouye',
      auths: [],
    },
  },
  {
    name: 'TestTask',
    path: '/testTask',
    component: () => import('@/views/testTask/TestTask.vue'),
    meta: {
      title: '试验记录',
      keepAlive: true,
      icon: 'icon-wendang',
      auths: [],
    },
  },
  {
    name: 'Project',
    path: '/project',
    component: () => import('@/views/project/Project.vue'),
    meta: {
      title: '项目管理',
      keepAlive: false,
      icon: 'icon-xiangmujiancehui',
      auths: [],
    },
  },
  {
    name: 'Template',
    path: '/template',
    component: () => import('@/views/template/Template.vue'),
    meta: {
      title: '模板管理',
      keepAlive: false,
      icon: 'icon-mobanguanlihui',
      auths: [],
    },
  },
  {
    name: 'My',
    path: '/my',
    component: () => import('@/views/my/My.vue'),
    meta: {
      title: '我的',
      keepAlive: false,
      icon: 'icon-wodehui',
      auths: [],
    },
  },
]

export default navRoutes
