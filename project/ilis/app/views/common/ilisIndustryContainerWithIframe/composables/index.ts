import { useIndustryStore } from '~/store/industryStore'

export function buildIframeSrc(src: string) {
  let iframeSrc = ''
  // if (import.meta.env.DEV) {
  //   src = 'feeModelController.do?list '
  // }
  if (!src) {
    iframeSrc = ''
    return iframeSrc
  }
  try {
    const { industry, industryId, sample } = toRefs(useIndustryStore())

    const url = new URL(src, location.origin)
    if (industry.value) {
      // 领域id不存在时，设置为undefined，避免后端路由重定向进入死循环
      url.searchParams.set('industryId', industryId.value || 'undefined')
      // url.searchParams.set('industry', JSON.stringify(industry.value))
    }
    if (sample.value) {
      url.searchParams.set('sample', JSON.stringify({
        name: sample.value.title,
        id: sample.value.id,
      }))
    }
    iframeSrc = url.toString().replace(`${url.origin}/`, '')
    return iframeSrc
  }
  catch (error) {
    console.error('构建iframe地址失败:', error)
    iframeSrc = src
    return iframeSrc
  }
}

/**
 * 从窗口链中获取industry参数值（common.js中有相同实现，注意保持同步）
 * @returns {string|null} 获取到的industry参数值，如果没有则返回null
 */
export function getIndustryFromWindowChain() {
  // 从当前窗口开始，向上遍历窗口链
  let currentWindow = window
  const originUrl = window.location.href
  const { industryList } = useIndustryStore()

  while (currentWindow) {
    try {
      // 尝试获取当前窗口的URL
      const url = currentWindow.location.href
      const urlParams = new URL(url).searchParams
      const industryId = urlParams.get('industryId')

      if (industryId && industryId !== 'null') {
        const industry = industryList.find(item => item.id === industryId)
        if (industry) {
          return industry
        }
        else {
          console.warn('未找到匹配的行业信息:', industryId)
          return null
        }
      }
    }
    catch (e) {
      // 跨域访问可能会抛出异常，继续尝试父窗口
      console.warn('获取窗口URL参数失败:', e)
    }

    // 如果已经到达顶层窗口或访问父窗口失败，则尝试最后从sessionStorage获取industry参数值，若失败则退出循环
    if (currentWindow === window.top || currentWindow.parent === currentWindow) {
      try {
        const sessionIndustry = JSON.parse(sessionStorage.getItem('industry') || '{}')
        const keys = Object.keys(sessionIndustry)
        const targetKey = keys.find(key => originUrl.includes(key))
        if (targetKey) {
          const industryId = sessionIndustry[targetKey]
          const industry = industryList.find(item => item.id === industryId)
          if (industry) {
            return industry
          }
          else {
            console.warn('未找到匹配的行业信息（top）:', industryId)
            return null
          }
        }
      }
      catch (e) {
        console.warn('获取sessionStorage的industry参数失败:', e)
      }
      break
    }

    // 移动到父窗口
    currentWindow = currentWindow.parent as any
  }

  return null
}
