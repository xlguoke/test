/**
 * 检查密码强度
 * @param password 密码字符串
 */
function checkPasswordStrength(password: string): number {
  let matchCount = 0
  const patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,./;'\\[\]·！￥…（）—《》？：“”【】、；‘，。]/

  if (!password) {
    return 0
  }

  if (/\d+/.test(password)) {
    matchCount++
  }
  if (/[a-z]+/.test(password)) {
    matchCount++
  }
  if (/[A-Z]+/.test(password)) {
    matchCount++
  }
  if (patrn.test(password)) {
    matchCount++
  }

  return matchCount
}

export { checkPasswordStrength }
