// 审核管理
export default [
  {
    path: '/auditManage/list',
    name: 'auditManage',
    meta: {
      title: '审核管理',
      keepAlive: true,
      functionCode: 'mobile_auditManage',
    },
    component: () => import('~/views/mobileApp/views/auditManage/list/index.vue'),
  },
  {
    path: '/auditManage/detail',
    name: 'auditDetail',
    meta: {
      title: '审批详情',
    },
    component: () => import('~/views/mobileApp/views/auditManage/detail/index.vue'),
  },
  {
    path: '/auditManage/audit',
    name: 'audit',
    meta: {
      title: '审批',
    },
    component: () => import('~/views/mobileApp/views/auditManage/audit/index.vue'),
  },
  {
    path: '/auditManage/addAudit',
    name: 'addAudit',
    meta: {
      title: '发起审批',
    },
    component: () => import('~/views/mobileApp/views/auditManage/addAudit/index.vue'),
  },
]
