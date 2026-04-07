import { defineStore } from 'pinia'
import { FunctionType } from '~/interface/IPermissionEntity.ts'
import { usePermissionStore } from '~/store/permissionStore.ts'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppIndustryStore } from '~/views/mobileApp/store/useAppIndustryStore.ts'

export const useAppUserStore = defineStore('appUser', {
  persist: true,
  state: () => {
    return {
      userInfo: null,
      companyId: '0000',
      companyName: '',
      companyLogo: '',
    }
  },
  actions: {
    async initUserBaseInfo() {
      const res = await mRequest.get(api.setting.getCurrentUser)
      if (res.success) {
        this.userInfo = res.obj
      }

      await Promise.all([
        // 更新领域信息
        useAppIndustryStore().init(),
        // 更新权限
        usePermissionStore().getPermissionAll(FunctionType.EXECUTE),
      ])
    },
    // 获取用户单位信息
    async initCompanyInfo() {
      const res = await mRequest.get(api.common.getConfigs)
      if (res && res.code === 20000) {
        this.companyId = res.company
        this.companyName = res.companyName
        this.companyLogo = res.companyLogo
      }
    },
  },
})
