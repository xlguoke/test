/**
 * ILIS被嵌入其他网站时相关支持方法
 */
export class EmbeddedHelper {
  /** ILIS是否被嵌入其他系统 */
  static get isEmbedded() {
    try {
      // 浏览器不允许内嵌的网页跨域访问，基于该特性判断是否被嵌入其他系统
      if (window.top && window.top.location.href) {
        return false
      }
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e) {
      return true
    }

    return false
  }
}
