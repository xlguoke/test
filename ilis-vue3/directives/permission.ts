import type { ObjectDirective } from 'vue'
import { usePermissionStore } from '~/store/permissionStore'

/**
 * # 权限指令
 */
export const permission: ObjectDirective = {
  mounted(el: HTMLElement, binding) {
    const { value } = binding
    const { hasPermission } = usePermissionStore()
    if (!hasPermission(value)) {
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  },
}
