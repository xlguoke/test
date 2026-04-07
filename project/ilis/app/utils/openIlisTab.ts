import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import IframeLayer from '~/components/IframeLayer.vue'
import { useIndustryStore } from '~/store/industryStore'

/**
 * 打开ILIS系统tab
 * 注：url为tab页签的唯一标识符，若调用多次打开的url一样时，实际只会打开一个tab
 * @param title 打开的tab显示名称
 * @param url 访问地址
 * @param useIndustry 是否使用领域
 */
export function openIlisTab(title: string, url: string, useIndustry?: boolean) {
  const { industry, industryId } = useIndustryStore()
  if (useIndustry && !url.includes('industryId')) {
    const separator = url.includes('?') ? '&' : '?'
    url += `${separator}industryId=${industryId}`
  }

  // 被嵌入到其他系统时，直接通过弹窗打开
  if (EmbeddedHelper.isEmbedded) {
    const normalizePath = (path: string) => `/ilis2/${path.replace(/^\/+/, '').replace(/^ilis2\//, '')}`

    AnyDialogHelper.showModel(IframeLayer, {
      title,
      url: normalizePath(url),
      hideConfirm: true,
      fullScreen: true,
    })
    return
  }

  if (window.top && window.top.addTabs) {
    top!.industry = industry
    window.top.addTabs({
      title,
      url,
      useIndustry,
    })
  }
  else {
    window.open(url)
  }
}
