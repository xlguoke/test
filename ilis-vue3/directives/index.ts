import type { App } from 'vue'
import { permission } from './permission'
import { lazyResize } from './lazyResize'

/**
 * # 批量注册指令
 */
export const directivePlugin = {
  install(app: App<Element>) {
    app.directive('permission', permission)
    app.directive('lazyResize', lazyResize)
  },
}
