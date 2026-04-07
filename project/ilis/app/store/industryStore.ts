import type { ViewSampleTreeNode } from '~/views/consign/component/selectSampleParam/modules/UseTestSample'
import type { IndustryConfig } from '~/views/unit-config/industryConfig'
import type { IndustryListEntity } from '~/views/unit-config/industryConfig/IndustryConfigEntity'
import { defineStore } from 'pinia'
import { getIndustryFromWindowChain } from '~/views/common/ilisIndustryContainerWithIframe/composables'
import { BUSINESS_SCOPE } from '~/views/unit-config/industryConfig'
import { getIndustryListByUser, industryFieldConfigApi } from '~/views/unit-config/industryConfig/api'

interface IndustryTermConfig {
  [key: string]: string
}

enum CacheKeyType {
  领域列表 = 'industryList',
  领域通用字段 = 'industryFields',
  领域业务模块 = 'industryModules',
  领域术语配置 = 'industryTerm',
}

/**
 * 领域信息
 */
export const useIndustryStore = defineStore('industry', () => {
  const urlParams = useUrlSearchParams()

  /** 当前选中的领域id */
  const industryId = ref(urlParams.industryId as string || '')

  /** 领域列表 */
  const industryList = ref<IndustryListEntity[]>([])

  /** 领域通用字段 */
  const industryFields = ref<IndustryConfig[]>([])

  /** 领域业务模块 */
  const industryModules = ref<IndustryConfig[]>([])

  /** 行业术语配置 */
  const industryTerm = ref<IndustryTermConfig>()

  const industryTermMatchList = computed(() => {
    return Object.keys((industryTerm.value || {})).sort((a: string, b: string) => b.length - a.length)
  })

  /** 获取领域业务模块配置 */
  function getModuleConfig(key: string) {
    const module = industryModules.value.find(i => i.fieldCode === key)
    if (industryModules.value.length && !module) {
      console.error(`未找到领域业务模块配置：${key}`)
    }
    return module
  }

  /** 当前选中的领域 */
  const industry = computed(() => {
    return industryList.value.find(item => item.id === industryId.value)
  })

  /** 当前选中样品 */
  const sample = ref<ViewSampleTreeNode>()

  async function setIndustryId(id: string) {
    industryId.value = id
    await init()
  }

  async function getIndustryOptions() {
    const { data } = await getIndustryListByUser()
    industryList.value = (data || []).sort((a, b) => (a.sort || 0) - (b.sort || 0))
    sessionStorage.setItem(CacheKeyType.领域列表, JSON.stringify(industryList.value))

    if (industryList.value?.length && !industryId.value) {
      let cid = null

      const industryByWindow = getIndustryFromWindowChain()
      if (industryByWindow) {
        cid = industryByWindow.id
      }

      if (!cid) {
        const defaultItem = industryList.value.find(i => i.defaulted)
        if (defaultItem) {
          cid = defaultItem.id
        }
      }

      if (!cid) {
        cid = industryList.value[0].id
      }

      industryId.value = cid
    }
    await init()
  }

  /**
   * 初始化当前领域信息
   */
  async function init() {
    if (!industryId.value)
      return
    await initIndustryFields()
    await initIndustryModules()
    await initIndustryTerm()
  }

  /**
   * 获取领域通用字段
   */
  function getField(fieldCode: string) {
    const field = industryFields.value.find(i => i.fieldCode === fieldCode)

    if (industryFields.value.length && !field) {
      console.error(`未找到领域通用字段配置：${fieldCode}`)
    }
    return field
  }

  /**
   * 行业术语控制
   */
  function term(fieldName: string) {
    if (!industryTerm.value) {
      return fieldName
    }

    if (!fieldName) {
      return ''
    }

    // 优先进行全文本匹配
    if (industryTerm.value[fieldName]) {
      return industryTerm.value[fieldName]
    }

    // 进行模糊匹配
    let str = fieldName
    const keys = industryTermMatchList.value

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (str.includes(key)) {
        str = str.replace(key, industryTerm.value[key])
      }
    }

    return str
  }

  // 初始化领域通用字段
  async function initIndustryFields() {
    const cache = getCache(CacheKeyType.领域通用字段)

    if (cache) {
      industryFields.value = cache
      return
    }

    const res = await industryFieldConfigApi({
      industryId: industryId.value,
      module: BUSINESS_SCOPE.COMMON,
    })

    industryFields.value = res.data
    setCache(CacheKeyType.领域通用字段, res.data)
  }

  // 初始化领域模块
  async function initIndustryModules() {
    const cache = getCache(CacheKeyType.领域业务模块)

    if (cache) {
      industryModules.value = cache
      return
    }

    const res = await industryFieldConfigApi({
      industryId: industryId.value,
      module: BUSINESS_SCOPE.MODULE,
    })

    industryModules.value = res.data
    setCache(CacheKeyType.领域业务模块, res.data)
  }

  // 初始化行业术语配置
  async function initIndustryTerm() {
    const cache = getCache(CacheKeyType.领域术语配置)

    if (cache) {
      industryTerm.value = cache
      return
    }

    const tc: IndustryTermConfig = {}

    industryFields.value.forEach((item) => {
      tc[item.fieldName] = item.fieldDisplayName || item.fieldName
    })

    industryModules.value.forEach((item) => {
      tc[item.fieldName] = item.fieldDisplayName || item.fieldName
    })

    const tRes = await industryFieldConfigApi({
      industryId: industryId.value,
      module: BUSINESS_SCOPE.TERMINOLOGY,
    })

    tRes.data.forEach((item) => {
      tc[item.fieldName] = item.fieldDisplayName || item.fieldName
    })
    industryTerm.value = tc
    setCache(CacheKeyType.领域术语配置, tc)
  }

  /**
   * 设置缓存
   */
  function setCache(key: CacheKeyType, value: any) {
    const cache = JSON.parse(sessionStorage.getItem(key) || '{}')

    cache[industryId.value] = value
    sessionStorage.setItem(key, JSON.stringify(cache))
  }

  /**
   * 读取缓存
   */
  function getCache(key: CacheKeyType) {
    const cache = JSON.parse(sessionStorage.getItem(key) || '{}')

    if (cache[industryId.value]) {
      return cache[industryId.value]
    }

    return null
  }

  /**
   * 清除缓存
   */
  function clearIndustryCache() {
    sessionStorage.removeItem(CacheKeyType.领域列表)
    sessionStorage.removeItem(CacheKeyType.领域通用字段)
    sessionStorage.removeItem(CacheKeyType.领域业务模块)
    sessionStorage.removeItem(CacheKeyType.领域术语配置)
  }

  return {
    industry,
    sample,
    industryId,
    industryList,
    industryTerm,
    getIndustryOptions,
    getField,
    getModuleConfig,
    term,
    setIndustryId,
    clearIndustryCache,
  }
})
