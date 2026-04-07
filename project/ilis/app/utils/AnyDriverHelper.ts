export class AnyDriverHelper {
  /** # 公共的创建方法 */
  private static create(url: string, {
    async = false,
    defer = false,
    force = false,
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const _id = url.replace('.', '')
      if (document.getElementById(_id) && !force)
        return resolve()
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = url
      script.id = _id
      script.async = async
      script.defer = defer
      document.body.appendChild(script)
      script.onload = () => {
        resolve()
      }
      script.onerror = (err) => {
        reject(err)
      }
    })
  }

  /**
   * 创建外部驱动js引入脚本
   * @param jsname
   */
  static async createScript(jsname: string, {
    async = false,
    defer = false,
  } = {}) {
    const baseUrl = import.meta.env.VITE_ILIS_DRIVERS
    const url = `${baseUrl}/${jsname}`
    return this.create(url, { async, defer })
  }

  /**
   * # 创建常规js脚本引入
   * - 建议仅为了兼容jsp等特殊情况下使用
   */
  static async createScriptByUrl(url: string, {
    async = false,
    defer = false,
    force = false,
  } = {}) {
    return this.create(url, { async, defer, force })
  }

  /** # 创建link引入css */
  static async createLinkByUrl(url: string) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
    return new Promise<void>((resolve, reject) => {
      link.onload = () => resolve()
      link.onerror = err => reject(err)
    })
  }
}
