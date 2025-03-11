export class AnyDriverHelper {
  /**
   * 创建外部驱动js引入脚本
   * @param jsname
   */
  static async createScript(jsname: string): Promise<void> {
    const baseUrl = import.meta.env.VITE_ILIS_DRIVERS

    return new Promise((resolve, reject) => {
      const _id = jsname.replace('.', '')
      if (document.getElementById(_id))
        return resolve()
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `${baseUrl}/${jsname}`
      script.id = _id
      document.body.appendChild(script)
      script.onload = () => {
        resolve()
      }
      script.onerror = (err) => {
        reject(err)
      }
    })
  }
}
