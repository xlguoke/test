/** 密码验证 */
export function useValidPassword() {
  // 根据系统控制参数设置密码最少位数 8~30
  let minPwdNum = 8
  let regExp: any = null

  // 用户密码长度最小字符
  getBusinessParamValue('PASSWORD_MINIMUM_LENGTH').then((res) => {
    const n = Number(res || '')
    minPwdNum = Math.max(8, Number.isNaN(n) ? 8 : n)
    regExp = new RegExp(`^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W!@#$%^&*_.()-+=]+$)(?![a-z0-9]+$)(?![a-z\W!@#$%^&*_.()-+=]+$)(?![0-9\W!@#$%^&*_.()-+=]+$)[a-zA-Z0-9\W!@#$%^&*_.()-+=]{${minPwdNum},30}$`)
  })

  /**
   * 验证新密码
   */
  function validPassword(newPassword: string) {
    if (newPassword && !regExp.test(newPassword))
      return Promise.reject(new Error(`密码由${minPwdNum}-30个字符组成，必须包含数字、大写字母、小写字母、特殊符号（!@#$%^&*_.）中的三种！`))
    else
      return Promise.resolve()
  }

  /**
   * 确认新密码
   */
  function validRePassword(rePassword: string, newPassword: string) {
    if (rePassword && rePassword !== newPassword)
      return Promise.reject(new Error('两次输入的密码不一致'))
    else
      return Promise.resolve()
  }

  return {
    validPassword,
    validRePassword,
  }
}
