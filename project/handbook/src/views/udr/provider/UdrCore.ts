/**
 * udr核心功能
 */
class UdrCore {
  /**
   * $this 代表当前webview ，多数用于android 上下文注入的一些方法
   */
  get $this(): UdrThis {
    return $global.getUdrMainFragment('udrTarget')
  }

  /**
   * $udr 表格操作相关的方法
   */
  get $udr(): Udr {
    return $global.getUdrCtrl('udrTarget')
  }

  /**
   * $util 主要是提供一些工具方法
   * 比如 js无法访问android 提供的List对象，然后需要借助 一些工具方法转换list然后让js好操作
   */
  get $util(): UdrUtil {
    return (window as any).$util || {}
  }

  get $global(): UdrMainActivity {
    return (window as any).$global || {}
  }
}

export const udrCore = new UdrCore()
