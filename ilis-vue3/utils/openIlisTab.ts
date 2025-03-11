/**
 * 打开ILIS系统tab
 * 注：url为tab页签的唯一标识符，若调用多次打开的url一样时，实际只会打开一个tab
 * @param title 打开的tab显示名称
 * @param url 访问地址
 */
export function openIlisTab(title: string, url: string) {
  if (window.top) {
    window.top.addTabs({
      title,
      url,
    })
  }
}
