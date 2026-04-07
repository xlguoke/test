import type { TopComponent } from '~/enum/TopComponent'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import '../main.css'

const componentMap: Record<TopComponent, any> = {
  /** 选择样品 */
  SelectSampleModal: defineAsyncComponent(() => import('~/views/consign/component/selectSample/SelectSampleModal.vue')),
  /** 选择样品参数 */
  SelectSampleParamModal: defineAsyncComponent(() => import('~/views/consign/component/selectSampleParam/SelectSampleParamModal.vue')),
  /** 设置参数过程信息 */
  SetParamProcessModal: defineAsyncComponent(() => import('~/views/unit-config/testParam/set-param-process-modal/index.vue')),
}

// 添加类型声明，使方法在TypeScript中可用
declare global {
  interface Window {
    /**
     * 在top层使用AnyDialogHelper
     */
    TopAnyDialogHelper: {
      /**
       * ## 在顶层窗口打开modal弹窗，用法同 AnyDialogHelper.showModel
       * @param componentKey 对话框内组件
       * @param param 对话框内组件的参数，需要携带领域id
       * @description 由于在顶层窗口打开，脱离原窗口，pinia无法共用，需要重新注册pinia，并初始化领域信息
       */
      showModel: <T>(componentKey: TopComponent, param: Record<string, any> & { industryId: string }) => Promise<T>
    }
  }
}

/**
 * 该文件在顶层layout已引入，子窗口直接通过top.TopAnyDialogHelper.showModel即可访问
 * 若不想全局弹窗，子窗口通过 includeBundles 引入，然后访问 TopAnyDialogHelper.showModel
 * 该文件仅在 跨iframe在顶层打开弹窗，或jsp页面打开vue弹窗组件使用，vue页面内部直接使用 AnyDialogHelper 即可
 */
;(async () => {
  const win = window || top?.window

  win.TopAnyDialogHelper = {
    showModel: async <T>(componentKey: TopComponent, param: Record<string, any> & { industryId: string }) => {
      if (!param || !param.industryId) {
      // eslint-disable-next-line no-alert
        alert('请在TopAnyDialogHelper参数中传入领域id（industryId）')
        return Promise.reject(new Error('参数中缺少领域id')) as T
      }
      const component = componentMap[componentKey]
      return await AnyDialogHelper.showModel<T>(component, param, true)
    },
  }
})()
