/** # 判断当前是否处于微信环境 */
export function isWechatEnv() {
  return /micromessenger/i.test(navigator.userAgent)
}
