import { defineStore } from 'pinia'
import { getUserFunctions } from '~/api/common'
import type { FunctionType, IPermissionAllEntity } from '~/interface/IPermissionEntity'

export const usePermissionStore = defineStore('permission', {
  state: () => {
    return {
      permissions: [] as IPermissionAllEntity[],
    }
  },
  actions: {
    /**
     * # 获取用户所有权限并缓存
     * @param functionType
     */
    async getPermissionAll(functionType: FunctionType) {
      const { data } = await getUserFunctions(functionType, false)
      this.permissions = data.obj
    },
    /**
     * # 判断用户是否有权限
     * @param permissionCode
     */
    hasPermission(permissionCode: string) {
      return this.permissions.some(item => item.code === permissionCode)
    },
  },
})
