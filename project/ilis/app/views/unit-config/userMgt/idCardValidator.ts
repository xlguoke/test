/**
 * 验证身份证信息
 * 该方法从老版jsp中同步而来
 */
export function idCardValidator(value: string) {
  /*
    该方法由网友提供;
    对身份证进行严格验证;
  */

  const Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1]// 加权因子;
  const ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2]// 身份证验证位值，10代表X;

  if (value.length === 15) {
    return isValidityBrithBy15IdCard(value)
  }
  else if (value.length === 18) {
    const a_idCard = value.split('')// 得到身份证数组
    if (isValidityBrithBy18IdCard(value) && isTrueValidateCodeBy18IdCard(a_idCard)) {
      return true
    }
    return false
  }
  return false

  function isTrueValidateCodeBy18IdCard(a_idCard: any) {
    let sum = 0 // 声明加权求和变量
    if (a_idCard[17].toLowerCase() === 'x') {
      a_idCard[17] = 10// 将最后位为x的验证码替换为10方便后续操作
    }
    for (let i = 0; i < 17; i++) {
      sum += Wi[i] * a_idCard[i]// 加权求和
    }

    const valCodePosition = sum % 11// 得到验证码所位置
    if (String(a_idCard[17]) === String(ValideCode[valCodePosition])) {
      return true
    }
    return false
  }

  function isValidityBrithBy18IdCard(idCard18: any) {
    const year = idCard18.substring(6, 10)
    const month = idCard18.substring(10, 12)
    const day = idCard18.substring(12, 14)
    const temp_date = new Date(year, Number.parseFloat(month) - 1, Number.parseFloat(day))
    // 这里用getFullYear()获取年份，避免千年虫问题
    if (temp_date.getFullYear() !== Number.parseFloat(year) || temp_date.getMonth() !== Number.parseFloat(month) - 1 || temp_date.getDate() !== Number.parseFloat(day)) {
      return false
    }
    return true
  }

  function isValidityBrithBy15IdCard(idCard15: any) {
    const year = idCard15.substring(6, 8)
    const month = idCard15.substring(8, 10)
    const day = idCard15.substring(10, 12)
    const temp_date = new Date(year, Number.parseFloat(month) - 1, Number.parseFloat(day))
    // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
    if (temp_date.getYear() !== Number.parseFloat(year) || temp_date.getMonth() !== Number.parseFloat(month) - 1 || temp_date.getDate() !== Number.parseFloat(day)) {
      return false
    }
    return true
  }
}
