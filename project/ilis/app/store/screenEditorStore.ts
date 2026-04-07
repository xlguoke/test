import type { IWidget } from '~/interface/IWidget'
import { defineStore } from 'pinia'

export const useScreenEditorStore = defineStore('screenEditor', {
  state: () => {
    return {
      /** # 渲染组件列表 */
      renderWidgets: [] as IWidget[],
      /** # 当前选中的组件 */
      currentWidget: null as IWidget | null,
      /** # 基础配置表单 */
      baseConfigFormState: {} as Record<string, any>,
    }
  },
  actions: {

  },
})
