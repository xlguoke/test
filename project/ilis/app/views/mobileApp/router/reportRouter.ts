// 报告管理
export default [
  {
    path: '/report/reportAudit',
    name: 'reportAudit',
    meta: {
      title: '报告审核',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
      functionCode: 'mobile_reportAuditSubmit,mobile_reportAuditBack,mobile_reportAuditNoticeModify',
    },
    component: () => import('~/views/mobileApp/views/report/reportAudit/index.vue'),
  },
  {
    path: '/report/reportApproval',
    name: 'reportApproval',
    meta: {
      title: '报告批准',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
      functionCode: 'mobile_reportApprovalSubmit,mobile_reportApprovalBack,mobile_reportApprovalNoticeModify',
    },
    component: () => import('~/views/mobileApp/views/report/reportApproval/index.vue'),
  },
  {
    path: '/report/electronicSignature',
    name: 'electronicSignature',
    meta: {
      title: '电子签名',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
      functionCode: '',
    },
    component: () => import('~/views/mobileApp/views/report/electronicSignature/index.vue'),
  },
  {
    path: '/report/electronicSignatureSeal',
    name: 'electronicSignatureSeal',
    meta: {
      title: '签章',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
      functionCode: 'mobile_electronicSignatureSealBack,mobile_electronicSignatureSealModify',
    },
    component: () => import('~/views/mobileApp/views/report/electronicSignatureSeal/index.vue'),
  },
  {
    path: '/report/qualificationStamp/:reportId',
    name: 'qualificationStamp',
    meta: {
      title: '设置报告印章',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
      functionCode: '',
    },
    component: () => import('~/views/mobileApp/views/report/components/qualificationStamp/index.vue'),
  },
  {
    path: '/report/qualificationStampPage/:reportId',
    name: 'qualificationStampPage',
    meta: {
      title: '设置签章页码',
      keepAlive: false,
      scrollTop: 0,
      resetPage: null,
      functionCode: '',
    },
    component: () => import('~/views/mobileApp/views/report/components/qualificationStampPage/index.vue'),
  },
  {
    path: '/report/reportDetail/:id/:sourceModule/:consignId?',
    name: 'reportDetail',
    meta: {
      title: '报告详情',
      keepAlive: true,
      // 滚动位置
      scrollTop: 0,
      // 是否重置缓存数据
      resetPage: null,
      // 是否已提交成功，用于交互逻辑处理
      isSubmit: false,
      functionCode: 'mobile_reportAuditSubmit,mobile_reportAuditBack,mobile_reportAuditNoticeModify,mobile_reportApprovalSubmit,mobile_reportApprovalBack,mobile_reportApprovalNoticeModify,mobile_electronicSignatureSealBack,mobile_electronicSignatureSealModify',
    },
    component: () => import('~/views/mobileApp/views/report/reportDetail/index.vue'),
  },
  {
    path: '/report/reviewApprovalOpinions/:id/:sourceModule/:consignId?',
    name: 'reviewApprovalOpinions',
    meta: {
      title: '复核审批意见',
    },
    component: () =>
      import('~/views/mobileApp/views/report/components/reviewApprovalOpinions/index.vue'),
  },
  {
    path: '/report/reportSubmitForm/:id/:reportState/:reportCode/:sourceModule/:consignId?',
    name: 'reportSubmitForm',
    meta: {
      title: '审核通过',
    },
    component: () =>
      import('~/views/mobileApp/views/report/components/reportSubmitForm/index.vue'),
  },
  {
    path: '/report/reportReturnForm/:id/:reportState/:reportType/:reportCode/:consignId?',
    name: 'reportReturnForm',
    meta: {
      title: '退回',
    },
    component: () =>
      import('~/views/mobileApp/views/report/components/reportReturnForm/index.vue'),
  },
  {
    path: '/report/reportNoticeModifyForm/:id/:reportState/:reportCode/:consignId?',
    name: 'reportNoticeModifyForm',
    meta: {
      title: '通知修改委托',
    },
    component: () =>
      import('~/views/mobileApp/views/report/components/reportNoticeModifyForm/index.vue'),
  },
]
