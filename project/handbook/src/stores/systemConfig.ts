import { defineStore } from 'pinia'
import { UdrlogLevel } from '@/views/testTask/udr'
import { request } from '@/axios'

export const useSystemConfigStore = defineStore('systemConfig', {
  persist: {
    paths: ['udrLogLevel'],
  },
  state: () => {
    return {
      udrLogLevel: UdrlogLevel.NONE,
    }
  },
  actions: {
    /**
     * 获取UDR日志级别控制参数
     */
    async getUdrLogLevel() {
      const { success, obj, msg } = await request({
        url: '/ilis2/rest/tSBusinessParamController.do?getBusinessParam&key=HANDBOOK_RECORD_MODIFY_LOG_TYPE',
      }) as { success: boolean, obj: string, msg: string }
      if (!success) {
        showToast({
          message: msg,
          type: 'fail',
        })
        return
      }
      if (obj === 'current')
        this.udrLogLevel = UdrlogLevel.FULL

      else if (obj === 'on_save')
        this.udrLogLevel = UdrlogLevel.ONCE

      else
        this.udrLogLevel = UdrlogLevel.NONE
    },
  },
})
