export class URLHelper {
  /**
   * # 获取url上的参数（search和hash）
   */
  static getUrlParam(name) {
    const urlParams = new URLSearchParams(location.search)
    const hashParams = new URLSearchParams(location.hash.split('?')[1])

    return urlParams.get(name) || hashParams.get(name)
  }
}
