import type { RouteRecord, RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

import { checkSessionIsExpires, reLogin } from '~/views/mobileApp/libs/session'
import { thirdLogin } from '~/views/mobileApp/provides/utils/thirdLogin'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'
// 审核管理
import auditMgrRouter from './auditMgrRouter'
import chemicalRouter from './chemicalRouter'
import equipmentAssetRouter from './equipmentAssetRouter'
// 铁科院设备调入 相关路由
import equipmentCallinRouter from './equipmentCallinRouter'
// 铁科院设备调出 相关路由
import equipmentCalloutRouter from './equipmentCalloutRouter'
import equipmentCheckSendRouter from './equipmentCheckSendRouter'
// 铁科院设备流转 相关路由
import equipmentExchangeRouter from './equipmentExchangeRouter'
// 铁科院设备移交 相关路由
import equipmentHandOverRouter from './equipmentHandOverRouter'
import equipmentInventoryRouter from './equipmentInventoryRouter'
// 铁科院设备管理列表 相关路由
import equipmentManagementRouter from './equipmentManagementRouter'
import equipmentOutwardApplicationRouter from './equipmentOutwardApplicationRouter'
// 设备综合管理 相关路由
import equipmentRouter from './equipmentRouter'
// 检查管理
import onSiteInspectionRouter from './onSiteInspectionRouter'
// 报告管理 相关路由
import reportRouter from './reportRouter'
// 样品流转 相关路由
import samplesRouter from './samplesRouter'
// 我的 相关路由
import settingRouter from './settingRouter'
// 标准物质购置验收
import standardMaterialAcceptRouter from './standardMaterialAcceptRouter'
// 标准物质管理
import standardMaterialRouter from './standardMaterialRouter'
// 台账 相关路由
import standingBook from './standingBook'
// 环境监测 相关路由
import temperature from './temperature'
// 试验管理
import testManageRouter from './testManageRouter'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      redirect: '/home',
    },
    //  登录
    {
      path: '/login',
      name: 'login',
      meta: {
        title: ' 登录',
      },
      component: () => import('~/views/mobileApp/views/login/index.vue'),
    },
    // 首页
    {
      path: '/home',
      name: 'home',
      meta: {
        title: '首页',
        functionCode: 'mobile_fieldSampling,mobile_sampleWarehousing,mobile_standardCuringStandingBook,mobile_temperature,mobile_equipmentAuthorization,mobile_testTask,mobile_reportAudit,mobile_reportApproval,mobile_samplesWarehousedStatistics,mobile_testStatistics,mobile_retentionStatistics,mobile_standardCuringStatistics,mobile_reportAuditStatistics,mobile_reportApprovalStatistics,mobile_unqualifiedTestStatistics,mobile_calibrationDueStatistics',
      },
      component: () => import('~/views/mobileApp/views/home/index.vue'),
    },
    // 外部iframe展示
    {
      path: '/outsideView',
      name: 'outsideView',
      meta: {
        title: '扫码内容',
      },
      component: () => import('~/views/mobileApp/views/outsideView/index.vue'),
    },
    {
      path: '/notice',
      name: 'notice',
      meta: {
        title: '公告列表',
      },
      component: () => import('~/views/mobileApp/views/notice/index.vue'),
    },
    {
      path: '/notice/noticeDetail/:id',
      name: 'noticeDetail',
      meta: {
        title: '公告详情',
      },
      component: () => import('~/views/mobileApp/views/notice/noticeDetail/index.vue'),
    },
    {
      path: '/message',
      name: 'message',
      meta: {
        title: '消息通知列表',
      },
      component: () => import('~/views/mobileApp/views/message/index.vue'),
    },
    {
      path: '/message/messageDetail/:id',
      name: 'messageDetail',
      meta: {
        title: '消息通知详情',
      },
      component: () => import('~/views/mobileApp/views/message/messageDetail/index.vue'),
    },
    {
      path: '/menuPage',
      name: 'menuPage',
      meta: {
        title: '菜单',
        functionCode: 'mobile_auditManage,mobile_fieldSampling,mobile_sampleCirculation,mobile_standardCuringPeriods,mobile_taskAssignment,mobile_testTask,mobile_unqualifiedTest,mobile_reportAudit,mobile_reportApproval,mobile_equipmentManagement,mobile_egressManagement,mobile_equipmentAuthorization,mobile_EquipmentRecord,mobile_sampleStandingBook,mobile_sampleStorageStandingBook,mobile_testPieceStorageStandingBook,mobile_sampleRetentionStandingBook,mobile_standardCuringStandingBook,mobile_outsourcingStandingBook,mobile_sampleWarehousing,mobile_temperature,mobile_electronicSignature,mobile_electronicSignatureSeal,mobile_xuncha,mobile_shiyanshi,mobile_yuyue,mobile_equipmentInventory,mobile_equipmentLocationReported,mobile_waichu,mobile_equipmentCheckSend,mobile_standard,mobile_eqGoOutBook,mobile_equipmentCheckConfirm',
      },
      component: () => import('~/views/mobileApp/views/menuPage/index.vue'),
    },
    // 设备鉴权成功
    {
      path: '/menuPage/verification',
      name: 'verification',
      meta: {
        title: '设备鉴权成功',
      },
      component: () => import('~/views/mobileApp/views/menuPage/verification/index.vue'),
    },
    // 授权记录
    {
      path: '/menuPage/verificationRecord',
      name: 'verificationRecord',
      meta: {
        title: '授权记录',
      },
      component: () => import('~/views/mobileApp/views/menuPage/verificationRecord/index.vue'),
    },
    // 授权设备控制
    {
      path: '/menuPage/iotDeviceRecord',
      name: 'iotDeviceRecord',
      meta: {
        title: '授权设备控制',
      },
      component: () => import('~/views/mobileApp/views/menuPage/iotDeviceRecord/index.vue'),
    },
    // 扫码新加的,且新加的扫码结果后面的逻辑
    {
      path: '/menuPage/iotDeviceManger',
      name: 'iotDeviceManger',
      meta: {
        title: '授权设备控制管理',
      },
      component: () => import('~/views/mobileApp/views/menuPage/iotDeviceManger/index.vue'),
    },
    // 授权设备扫码结果
    {
      path: '/menuPage/iotDeviceScanResult',
      name: 'iotDeviceScanResult',
      meta: {
        title: '扫码结果',
      },
      component: () => import('~/views/mobileApp/views/menuPage/iotDeviceScanResult/index.vue'),
    },
    {
      path: '/menuSearch',
      name: 'menuSearch',
      meta: {
        title: '功能搜索',
        functionCode: 'mobile_auditManage,mobile_fieldSampling,mobile_sampleCirculation,mobile_standardCuringPeriods,mobile_taskAssignment,mobile_testTask,mobile_unqualifiedTest,mobile_reportAudit,mobile_reportApproval,mobile_equipmentManagement,mobile_egressManagement,mobile_equipmentAuthorization,mobile_EquipmentRecord,mobile_sampleStandingBook,mobile_sampleStorageStandingBook,mobile_testPieceStorageStandingBook,mobile_sampleRetentionStandingBook,mobile_standardCuringStandingBook,mobile_outsourcingStandingBook,mobile_sampleWarehousing,mobile_temperature,mobile_electronicSignature,mobile_electronicSignatureSeal,mobile_xuncha,mobile_shiyanshi,mobile_yuyue,mobile_equipmentInventory,mobile_equipmentLocationReported,mobile_waichu,mobile_equipmentCheckSend,mobile_standard,mobile_eqGoOutBook,mobile_equipmentCheckConfirm',
      },
      component: () => import('~/views/mobileApp/views/menuSearch/index.vue'),
    },
    {
      path: '/insetApp',
      name: 'insetApp',
      meta: {
        title: '嵌入应用',
      },
      component: () => import('~/views/mobileApp/views/insetApp/index.vue'),
    },
    ...reportRouter,
    ...samplesRouter,
    ...equipmentRouter,
    ...equipmentManagementRouter,
    ...equipmentCalloutRouter,
    ...equipmentCallinRouter,
    ...equipmentHandOverRouter,
    ...equipmentExchangeRouter,
    ...standingBook,
    ...temperature,
    ...settingRouter,
    ...testManageRouter,
    ...onSiteInspectionRouter,
    ...auditMgrRouter,
    ...equipmentInventoryRouter,
    ...equipmentOutwardApplicationRouter,
    ...equipmentCheckSendRouter,
    ...equipmentAssetRouter,
    ...chemicalRouter,
    ...standardMaterialRouter,
    ...standardMaterialAcceptRouter,
    {
      path: '/hitekUdrPage/:testTaskId/:objectUdrId/:htmlJsFile/:htmlUrl/:templateName',
      name: 'hitekUdrPage',
      meta: {
        title: '资料',
      },
      component: () => import('~/views/mobileApp/views/hitekUdrPage/index.vue'),
    },
    {
      path: '/bluetoothPrint/:type/:testObjectId/:pageFrom?',
      name: 'bluetoothPrint',
      meta: {
        title: '打印机打印',
        keepAlive: true,
      },
      component: () => import('~/views/mobileApp/views/bluetoothPrint/index.vue'),
    },
    {
      path: '/:pathMatch(.*)',
      redirect: '/',
    },
  ],
})

// 权限校验
router.beforeEach(async (to, from, next) => {
  const appUserStore = useAppUserStore()

  // 第三方授权登录
  const thirdLoginResult = await thirdLogin.checkThirdLogin()

  // 第三方授权登录成功
  if (thirdLoginResult === true) {
    next()
    return
  }

  // 第三方授权登录失败，阻止路由继续，避免进入登录页
  if (thirdLoginResult === 'error') {
    next(false)
    return
  }

  if (!('reportDetail,auditDetail').includes(to.name)) { // 设置白名单，允许白名单页面直接跳转，不验证登录状态
    // 本地存有 登录信息时，依据 登录信息来判断用户 登录状态
    if (to.name !== 'login' && !appUserStore.userInfo) {
      next({ name: 'login', query: to.name === 'home' ? {} : { redirectURL: to.path } })
      return
    }

    // 如果session已过期，则重新登录
    if (checkSessionIsExpires() && localStorage.getItem('userLoginInfo') && appUserStore.userInfo) {
      if (await reLogin()) {
        next()
      }
      else {
        next('/login')
      }
      return
    }
  }

  if (to.name === 'login' && appUserStore.userInfo) {
    next('/home')
    return
  }

  const { companyId, initCompanyInfo } = useAppUserStore()
  if (companyId === '0000') {
    await initCompanyInfo()
  }

  next()
})

// 权限校验
router.afterEach(() => {
  const body = document.document || document.body
  if (body) {
    body.scrollTop = 0
  }
})

// 获取所有需要keepAlive的路由
function getKeepAliveRoutes(routes: RouteRecord[] | RouteRecordRaw[]) {
  const result: string[] = []

  for (let i = 0; i < routes.length; i++) {
    const item = routes[i]

    if (item.meta?.keepAlive) {
      result.push(item.name)
    }

    if (item.children && item.children.length > 0) {
      result.push(getKeepAliveRoutes(item.children))
    }
  }

  return result
}

export const keepAliveRouteNames = getKeepAliveRoutes(router.getRoutes())

export default router
