import { usePermissionStore } from '@/stores'
import type { ObjectDirective } from 'vue'

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
