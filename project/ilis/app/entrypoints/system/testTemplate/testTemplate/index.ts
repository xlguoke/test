import { message, Modal } from 'ant-design-vue'
import qs from 'qs'
import { captureException } from '~/internal/tracing'
import oAjax from '~/providers/common/ajax'
import oApi from '~/providers/common/api'
import * as msgTips from '~/providers/common/msgTips'
import oPageConfig from '~/providers/common/pageConfig'
import oRest from '~/providers/common/request'
import Main from '~/views/system/testTemplate/testTemplate/App/index.vue'
import router from '~/views/system/testTemplate/testTemplate/router/index'
import '~/main.ts'
import '~/providers/transformUtils/transform.less';

(async function () {
  const el = document.querySelector<HTMLElement>('#testTemplate')

  if (!el) {
    console.warn('#testTemplate not found')
    return
  }

  const app = createApp(Main, {})

  await AppInitHelper.usePermission(app)

  app.config.errorHandler = (err) => {
    captureException(err).catch(console.error)
  }

  app.use(router)

  window.pageConfig = oPageConfig
  window.$oAjax = oAjax
  window.$oRest = oRest
  window.$oApi = oApi
  window.$oQs = qs
  window.$oMsgTips = msgTips
  window.$oAntdConfirm = Modal.confirm
  window.$oAntdModal = Modal
  window.$oAntdMessage = message
  window.$oErrorAlert = function (msg: string, opt: any) {
    msg = msg || '系统异常，请稍后重试或联系技术支持人员或客服'
    if (window.$oMsgTipsAlert) {
      window.$oMsgTipsAlert.destroy()
    }
    window.$oMsgTipsAlert = window.$oAntdModal.error(msgTips.info(msg, opt))
  }

  window.$oForceUpdate = function () {
    // Vue 3 中，没有直接等价于 Vue 2 中的 $forceUpdate() 方法，Vue 3 在响应式系统和组件更新机制上进行了重大改进，因此不再需要显式地强制重新渲染组件
    // 此处仅替换做兼容处理
  }

  window.$oNextTick = function (cb) {
    return nextTick(cb)
  }

  app.mount('#testTemplate')
})()
