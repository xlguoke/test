export interface AndroidInterface {
  getDeviceId: () => string
  restartApp: () => void
  getAppVersion: () => string
  checkUpdate: () => void
}

class AndroidTools {
  private AndroidInterface?: AndroidInterface

  constructor() {
    if (window.AndroidInterface) {
      this.AndroidInterface = window.AndroidInterface
    } else {
      console.warn("当前非安卓环境，部分逻辑不会执行！")
    }
  }

  private execute(funname: keyof AndroidInterface) {
    try {
      if (this.AndroidInterface) {
        return this.AndroidInterface[funname]()
      }
    } catch (e) {
      alert(JSON.stringify(e))
    }

    return null
  }

  /**
   * 获取硬件编码
   */
  getDeviceId() {
    return this.execute("getDeviceId")
  }

  /**
   * 重启APP
   */
  restartApp() {
    this.execute("restartApp")
  }

  /**
   * 获取安卓版本
   */
  getAppVersion() {
    return this.execute("getAppVersion")
  }

  /**
   * 检查新版本
   */
  checkUpdate() {
    return this.execute("checkUpdate")
  }
}

export const androidTools = new AndroidTools()
