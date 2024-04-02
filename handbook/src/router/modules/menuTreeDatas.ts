import type { RouteRecordRaw } from 'vue-router'
import nav from './nav'
import Layout from '@/layout/index.vue'

const routeList: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/home',
    meta: {
      title: '首页',
    },
    children: [
      ...nav,
      {
        name: 'SelTemplate',
        path: '/selected/selTemplate/:id?',
        component: () => import('@/views/testTask/selectedData/SelTemplate.vue'),
        props: true,
        meta: {
          title: '选择模板',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'SelSample',
        path: '/selected/sample',
        component: () => import('@/views/testTask/selectedData/SelSample.vue'),
        props: true, // 允许通过props传递路由参数
        meta: {
          title: '选择样品',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'SelParam',
        path: '/selected/param',
        component: () => import('@/views/testTask/selectedData/SelParam.vue'),
        meta: {
          title: '选择检测参数',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'SelStandard',
        path: '/selected/standard',
        component: () => import('@/views/testTask/selectedData/SelStandard.vue'),
        meta: {
          title: '选择规程',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'SelProject',
        path: '/selected/project/:id?',
        component: () => import('@/views/testTask/selectedData/SelProject.vue'),
        props: true,
        meta: {
          title: '选择工程项目',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'SelUnitProject',
        path: '/selected/unitProject',
        component: () => import('@/views/testTask/selectedData/SelUnitProject.vue'),
        props: true,
        meta: {
          title: '选择工程划分',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'TestTaskDetail',
        path: '/testTaskDetail',
        component: () => import('@/views/testTask/components/TestTaskDetail.vue'),
        children: [],
        meta: {
          title: '试验详情',
          icon: '',
          auths: [],
        },
      },
      {
        name: 'TestTaskRegister',
        path: '/testTaskRegister',
        component: () => import('@/views/testTask/components/TestTaskRegister.vue'),
        children: [],
        meta: {
          title: '试验登记',
          keepAlive: true,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'UploadManage',
        path: '/uploadManage',
        component: () => import('@/views/uploadManage/UploadManage.vue'),
        children: [],
        meta: {
          title: '上传列表',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'TemplateList',
        path: '/templateList',
        component: () => import('@/views/template/components/TemplateList.vue'),
        children: [],
        meta: {
          title: '模板-测试',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'UpdateManage',
        path: '/my/updateManage',
        component: () => import('@/views/my/components/UpdateManage.vue'),
        children: [],
        meta: {
          title: '离线数据更新管理',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'SysSetting',
        path: '/my/sysSetting',
        component: () => import('@/views/my/components/SysSetting.vue'),
        children: [],
        meta: {
          title: '系统设置',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'AccountSafe',
        path: '/my/accountSafe',
        component: () => import('@/views/my/components/AccountSafe.vue'),
        children: [],
        meta: {
          title: '账号安全设置',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'AccountManage',
        path: '/my/accountManage',
        component: () => import('@/views/my/components/AccountManage.vue'),
        children: [],
        meta: {
          title: '账号管理',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'AboutUs',
        path: '/my/aboutUs',
        component: () => import('@/views/my/components/AboutUs.vue'),
        children: [],
        meta: {
          title: '关于',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        name: 'Logs',
        path: '/my/logs',
        component: () => import('@/views/my/components/Logs.vue'),
        meta: {
          title: '日志',
          keepAlive: false,
          icon: '',
          auths: [],
        },
      },
      {
        path: '/my/logs/:name',
        component: () => import('@/views/my/components/Log.vue'),
      },
    ],
  },
]

export default routeList
