import { useAppIndustryStore } from '~/views/mobileApp/store/useAppIndustryStore.ts'

export function useAppIndustryHooks() {
  const { industryTerm, industryFields } = storeToRefs(useAppIndustryStore())

  function term(fieldName: string) {
    const _industryTerm = industryTerm.value || {}

    // 优先全文本匹配
    if (_industryTerm[fieldName]) {
      return _industryTerm[fieldName]
    }

    // 进行模糊匹配
    let str = fieldName
    const keys = Object.keys(_industryTerm).sort((a, b) => b.length - a.length)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (str.includes(key) !== -1) {
        str = str.replace(key, _industryTerm[key])
      }
    }

    return str
  }

  function getIndustryField(fieldCode: string) {
    return industryFields.value.find((item) => {
      return item.fieldCode === fieldCode
    })
  }

  return {
    getIndustryField,
    term,
  }
}
