// 检查管理
export default [
  // 检查列表
  {
    path: '/onSiteInspection/inspectList',
    name: 'inspectList',
    meta: {
      title: '检查管理',
      functionCode: 'mobile_reportAuditSubmit,mobile_reportAuditBack,mobile_reportAuditNoticeModify',
    },
    component: () => import('~/views/mobileApp/views/onSiteInspection/inspectList/index.vue'),
  },
  // 检查详情
  {
    path: '/onSiteInspection/inspectDetail',
    name: 'inspectDetail',
    meta: {
      title: '检查详情',
      functionCode: 'mobile_reportAuditSubmit,mobile_reportAuditBack,mobile_reportAuditNoticeModify',
    },
    component: () => import('~/views/mobileApp/views/onSiteInspection/inspectDetail/index.vue'),
  },

]
