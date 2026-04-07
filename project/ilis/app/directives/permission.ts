import type { ObjectDirective } from 'vue'
import { usePermissionStore } from '~/store/permissionStore'
/**
 * # 权限指令(支持数组和字符串)
 */
export const permission: ObjectDirective = {
  mounted(el: HTMLElement, binding) {
    const { value } = binding
    const { hasPermission } = usePermissionStore()
    if (!value) {
      return
    }
    // 支持数组和字符串
    if (Array.isArray(value)) {
      if (!value.some(permission => hasPermission(permission))) {
        el.style.setProperty('display', 'none', 'important')
      }
    }
    else if (!hasPermission(value)) {
      // 移除节点调整为 display: none -by wucheng 2025-08-25
      el.style.setProperty('display', 'none', 'important')
    }
  },
}
