import type { TransformMenuTree } from '../api'
import { useMenuStore } from '~/store/menuStore'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { OpenType } from '../api'

interface addTabsOptions {
  title: string
  url: string
  useIndustry?: boolean
  opentype?: OpenType
  id?: string
}

/** # URL处理结果接口 ⚙️ */
interface UrlProcessResult {
  /** 处理后的URL */
  url: string
  /** 是否需要外部打开 */
  shouldOpenExternally: boolean
}

/** # 对历史页面打开新页签的兼容 */
export function useTabs() {
  /** # 设置领域信息 */
  function setIndustry(url: string): string {
    const industry = top!.industry
    if (!industry)
      return url
    // 领域信息添加到url中,用于头信息分辨
    if (!url.includes('industryId')) {
      url = url.includes('?') ? `${url}&industryId=${industry.id}` : `${url}?industryId=${industry.id}`
    }
    // 之前的领域信息
    const oldIndustry = JSON.parse(sessionStorage.getItem('industry') || '{}')
    sessionStorage.setItem('industry', JSON.stringify({
      ...oldIndustry,
      [url]: industry.id,
    }))
    return url
  }

  /** # udr打开地址 */
  async function checkUdrUrl(url: string) {
    const { data } = await IlisApiHelper.post('rest/functionController/platform/cert', {
      url,
    })
    window?.openHitekUdrTool(data)
  }

  /** # 获取三方平台页面 */
  async function getThirdPartyPlatformPage(url: string) {
    const { data } = await IlisApiHelper.post<string>('rest/functionController/platform/cert', {
      url,
    })
    return data
  }

  /** # 处理URL逻辑（提取公共部分）⚙️ */
  async function processUrl(url: string, opentype: OpenType): Promise<UrlProcessResult> {
    let newUrl = url

    // 检查是否需要UDR处理
    if (newUrl?.includes('?tc=1')) {
      checkUdrUrl(newUrl)
      return { url: newUrl, shouldOpenExternally: true }
    }

    // 处理第三方平台页面
    if (newUrl?.indexOf('http') === 0) {
      newUrl = await getThirdPartyPlatformPage(newUrl)
    }

    // 判断是否需要外部打开
    const shouldOpenExternally = (!newUrl?.includes('http') && opentype === OpenType.OUTSIDE)
      || (newUrl?.indexOf('http') === 0 && opentype !== OpenType.INSET)

    if (shouldOpenExternally && !newUrl?.includes('http')) {
      // 构建完整的基础路径
      const strFullPath = window.document.location.href
      const strPath = window.document.location.pathname
      const pos = strFullPath.indexOf(strPath)
      const prePath = strFullPath.substring(0, pos)
      const postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1)
      const basePath = prePath + postPath
      newUrl = `${basePath}/${newUrl}`
    }

    return { url: newUrl, shouldOpenExternally }
  }

  async function addTabs(options: addTabsOptions) {
    const { setActiveMenu, openMenus } = useMenuStore()
    const { title, url, useIndustry = true, opentype = OpenType.INSET, id } = options
    if (!url?.trim()?.length)
      return
    // 新功能 #17746 增加与帮助系统的集成 存储当前页面路由
    top!.window.helpSystemInfo = { title, url }
    let newUrl = url

    if (useIndustry)
      newUrl = setIndustry(url)

    // 使用共享的URL处理逻辑
    const { url: processedUrl, shouldOpenExternally } = await processUrl(newUrl, opentype)

    if (shouldOpenExternally) {
      window.open(processedUrl)
      return
    }

    let menuId = id || processedUrl

    // 修复外链因为时间参数不一致导致的重复打开多个tab
    if (processedUrl.indexOf('http') === 0) {
      const delkeys = ['date', 'token']
      const urlObj = new URL(processedUrl)
      delkeys.forEach((key) => {
        urlObj.searchParams.delete(key)
      })
      menuId = urlObj.toString()
    }

    /**
     * # 处理id冲突问题 🐛
     * 当传入的id已存在，但对应的URL与当前要打开的URL不同时，
     * 说明是不同的页面使用了相同的id，此时应该使用processedUrl作为id
     */
    if (id) {
      const existingMenu = openMenus.find(item => item.data.id === id)
      if (existingMenu && existingMenu.data.functionUrl !== processedUrl) {
        menuId = processedUrl
      }
    }

    const targetMenu: TransformMenuTree = {
      data: {
        id: menuId,
        functionName: title,
        functionUrl: processedUrl,
        openType: opentype,
        functionLevel: 0,
        subFunctions: [],
        functionType: 0,
      },
      key: menuId,
      title,
      label: title,
    }

    setActiveMenu(targetMenu)
  }

  return { addTabs, checkUdrUrl, getThirdPartyPlatformPage, processUrl }
}
