import { defineStore } from 'pinia'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export const useAppIndustryStore = defineStore('appIndustry', {
  persist: true,
  state: () => {
    return {
      // 领域id
      industryId: '',
      // 领域信息
      industryData: {},
      // 领域列表
      industryList: [],
      // 领域配置
      industryConfig: [],
      // 领域术语配置
      industryTerm: {},
      // 领域通用字段
      industryFields: [],
      // 领域业务模块
      industryModules: [],
    }
  },
  actions: {
    // 设置领域ID
    setIndustryId(id: string) {
      this.industryId = id
      this.industryData = this.industryList.find((item) => {
        return item.id === id
      }) || {}
      this.initIndustryInfo()
    },
    // 初始化
    async init() {
      const res = await mRequest.get('rest/industry/user')
      const industryList = res.data
      this.industryList = industryList

      // 兼容逻辑，避免切换账号导致的领域id匹配不上
      if (this.industryId && !industryList.find(i => i.id === this.industryId)) {
        this.industryId = ''
      }

      if (industryList.length > 0 && !this.industryId) {
        const defaultIndustry = industryList.find(i => i.defaulted)
        if (defaultIndustry) {
          this.industryId = defaultIndustry.id
        }
        else {
          this.industryId = industryList[0].id
        }
      }

      this.industryData = industryList.find((item: any) => {
        return item.id === this.industryId
      }) || {}

      await this.initIndustryInfo()
    },
    async initIndustryInfo() {
      const [industryFieldsRes, industryModulesRes] = await Promise.all([
        mRequest.get(`rest/industry/field/${this.industryId}/COMMON`),
        mRequest.get(`rest/industry/field/${this.industryId}/MODULE`),
      ])

      this.industryFields = industryFieldsRes.data
      this.industryModules = industryModulesRes.data

      await this.initIndustryTerm()
    },
    // 获取领域配置
    async initIndustryTerm() {
      const industryId = this.industryId
      const industryFields = this.industryFields
      const industryModules = this.industryModules

      const tc: Record<string, string | undefined> = {}

      industryFields.forEach((item: any) => {
        tc[item.fieldName] = item.fieldDisplayName
      })

      industryModules.forEach((item: any) => {
        tc[item.fieldName] = item.fieldDisplayName
      })

      const res = await mRequest.get(`rest/industry/field/${industryId}/TERMINOLOGY`)
      res.data.forEach((item: any) => {
        tc[item.fieldName] = item.fieldDisplayName || item.fieldName
      })

      this.industryTerm = tc
    },
  },
})
