import type { CONSIGN_SIGN_TYPE } from '.'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

// 签字人信息
export interface SignaturePerson {
  /** 身份 */
  identity: CONSIGN_SIGN_TYPE
  /** 签字人姓名 */
  name: string
  /** 签字人手机号 */
  phone: string
  /** 签字状态 */
  signed: boolean
  /** 禁止选择 */
  disabled?: boolean
  /** 唯一key */
  key: string
}

/**
 * # 获取委托签字人信息
 */
export function getConsignSignPerson(consignIds: string[]) {
  const ids = consignIds.join('&consignIds=')
  return IlisApiHelper.get<SignaturePerson[]>(`rest/consign/sign/person?consignIds=${ids}`)
}

/**
 * # 获取二维码路径
 */
export function consignQrcodeByPhone(phone: string) {
  return IlisApiHelper.get<string>(`rest/consign/qrcode?phone=${phone}`)
}

/**
 * # 发送签名短信
 * @param consignId 委托ID
 * @param data 签名人手机号
 */
export function sendSignSms(consignId: string, data: string[]) {
  return IlisApiHelper.post(`rest/consign/sign/sms/${consignId}`, data)
}

/**
 * 获取报告领取签字人信息
 */
export function getReportSignPerson(reportId: string) {
  return IlisApiHelper.get<SignaturePerson[]>(`rest/report/issue/sign/person/${reportId}`)
}

/**
 * 报告领取: 获取二维码路径
 */
export function reportQrcodeByPhone(phone: string) {
  return IlisApiHelper.get<string>(`rest/report/issue/sign/qrcode?phone=${phone}`)
}

/**
 * # 报告领取：发送签名短信
 * @param reportId 报告ID
 * @param data 签名人手机号
 */
export function sendSignSmsReport(reportId: string, data: string[]) {
  return IlisApiHelper.post(`rest/report/issue/sign/sms/${reportId}`, data)
}
