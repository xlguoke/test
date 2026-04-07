import type { ISystemParam } from '~/api/system/system-param/types'
/**
 * # 系统参数模块
 */
import { defineStore } from 'pinia'
import { getAllSystemParamsApi } from '~/api/system/system-param'

/**
 * ## 系统参数模块
 * @param config 配置项
 * @param config.immediate 是否立即初始化
 */
export const useSystemParamStore = defineStore('systemParamStore', () => {
  const systemParams = reactive<ISystemParam>({})

  async function init() {
    if (Object.keys(systemParams).length) {
      return
    }
    try {
      const { data } = await getAllSystemParamsApi()
      const dataObj = data.data || {}
      for (const key in dataObj) {
        if (key === '99294034538790917') {
          systemParams.COMPOUND_ITEMS = !!dataObj[key]
        }
        else {
          (systemParams as any)[key] = dataObj[key]
        }
      }
    }
    catch (err) {
      console.error('获取系统参数失败', err)
    }
  }

  init()

  return { systemParams, initSystemParams: init }
})
