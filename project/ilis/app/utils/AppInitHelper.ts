import type { App } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { directivePlugin } from '~/directives'
import { FunctionType } from '~/interface/IPermissionEntity'
import { useIndustryStore } from '~/store/industryStore'
import { useMenuStore } from '~/store/menuStore'
import { usePermissionStore } from '~/store/permissionStore'

export class AppInitHelper {
  /**
   * # 使用权限（会挂载store和注册自定义权限指令）
   * @param instance Vue实例
   * @description 用法示例
   * ```ts
   *    <a-button v-permission="'user:add'">新增</a-button>
   * ```
   */
  static async usePermission(instance: App<Element>) {
    this.useStore(instance)
    this.useDirectives(instance)

    const { getPermissionAll } = usePermissionStore()
    const { getIndustryOptions } = useIndustryStore()
    const { getMenuList } = useMenuStore()
    await Promise.all([getIndustryOptions(), getPermissionAll(FunctionType.EXECUTE), getMenuList()])
    // instance.directive('permission', permission)
  }

  /**
   * # 移动端权限
   * @param instance Vue实例
   */
  static async useMobilePermission(instance: App<Element>) {
    this.useStore(instance)
    this.useDirectives(instance)
    const { getPermissionAll } = usePermissionStore()
    await getPermissionAll(FunctionType.EXECUTE)
  }

  /**
   * # 创建并挂载store
   * @param instance Vue实例
   */
  static useStore(instance: App<Element>) {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    instance.use(pinia)
  }

  /**
   * # 使用所有的自定义指令
   * @param instance Vue实例
   */
  static useDirectives(instance: App<Element>) {
    instance.use(directivePlugin)
  }
}
