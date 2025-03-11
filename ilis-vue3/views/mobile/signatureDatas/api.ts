import type { CONSIGN_SIGN_TYPE } from '~/components/onlineSignature'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * 委托列表
 */
export interface ConsignSignature {
  id: string // 前端添加，做为唯一key，值为consignId
  consignId: string
  consignUnitId: string
  projectId: string
  consignCode: string
  consignUnitName: string
  projectName: string
  testUnitName: string
  signName: string
  signPhone: string
  identity: CONSIGN_SIGN_TYPE
}

/**
 * 保存委托签名参数
 */
interface SaveSignaturesParam {
  consignInfos: Array<{
    consignId: string
    consignUnitId: string
    consignProjectId: string
    identity: CONSIGN_SIGN_TYPE
  }>
  signUrl: string
  signUser?: string
  signPhone?: string
  attachmentIds?: string[]
}

/**
 * 报告列表
 */
export interface ReportSignature {
  id: string // 前端添加，做为唯一key，值为reportId
  reportId: string
  consignUnitName: string
  consignCode: string
  sampleCode: string
  reportCode: string
  testUnitName: string
  projectName: string
}

/**
 * 保存报告签名参数
 */
interface SaveReportSignaturesParam {
  /** 报告id */
  reportIds: string[]
  /** 签字电话 */
  signPhone: string
  /** 签字图片地址 */
  signUrl: string
}

function setHearders() {
  return {
    headers: {
      'Unit-Code': sessionStorage.getItem('unitCode'),
    },
  }
}

/**
 * # 获取委托方待签字列表
 * @param {string} encodePhone 加密过的手机号
 */
export function getConsignSignatureTobeList(encodePhone: string) {
  return IlisApiHelper.get<ConsignSignature[]>(`rest/sign/consign/tobe-signed?encodePhone=${encodePhone}`, {}, setHearders())
}

/**
 * # 获取委托方已签字列表
 * @param {string} encodePhone 加密过的手机号
 */
interface SignatureList {
  encodePhone: string
  page: number
  size: number
}
export function getConsignSignatureList(params: SignatureList) {
  return IlisApiHelper.get<{
    count: number
    rows: ConsignSignature[]
  }>(`rest/sign/consign/signed`, params, setHearders())
}

/**
 * # 保存委托签字信息
 */
export function saveConsignSignature(data: SaveSignaturesParam) {
  return IlisApiHelper.post(`rest/sign/consign/signatures`, data, {
    headers: {
      'Unit-Code': sessionStorage.getItem('unitCode'),
    },
  })
}

/**
 * 获取最后的签字图片
 */
export function getLastSignPhoto(encodePhone: string) {
  return IlisApiHelper.get<string>(`rest/sign/consign/last-photo/${encodePhone}`, {}, setHearders())
}

/**
 * 获取最后的签字附件
 */
export function getLastSignAttachments(encodePhone: string) {
  return IlisApiHelper.get<any[]>(`rest/sign/consign/last-attachments/${encodePhone}`, {}, setHearders())
}

/**
 * 获取委托单PDF
 */
export function getConsignOrder(consignId: string) {
  return IlisApiHelper.get<string>(`rest/sign/consign/order/${consignId}`, {}, setHearders())
}

/**
 * # 获取报告领取待签字列表
 * @param {string} encodePhone 加密过的手机号
 */
export function getReportSignatureTobeList(encodePhone: string) {
  return IlisApiHelper.get<ReportSignature[]>(`rest/sign/report/tobe-signed?encodePhone=${encodePhone}`, {}, setHearders())
}

/**
 * # 获取报告领取已签字列表
 */
export function getReportSignatureList(params: SignatureList) {
  return IlisApiHelper.get<{
    rows: ReportSignature[]
    count: number
  }>(`rest/sign/report/signed`, params, setHearders())
}

/**
 * # 保存报告领取签字信息
 */
export function saveReportSignature(data: SaveReportSignaturesParam) {
  return IlisApiHelper.post(`rest/sign/report/signatures`, data, setHearders())
}

/**
 * 获取报告最后的签字图片
 */
export function getLastReportSignPhoto(encodePhone: string) {
  return IlisApiHelper.get<string>(`rest/sign/report/last-photo/${encodePhone}`, {}, setHearders())
}

/**
 * 获取报告信息
 */
export interface ReportInfo {
  columnKey: string
  columnName: string
  columnValue: string
}

export function getReportInfo(reportId: string) {
  return IlisApiHelper.get<ReportInfo[]>(`rest/sign/report/info/${reportId}`, {}, setHearders())
}

/**
 * # 手机后四位验证
 */
interface PhoneCheckData {
  /** 加密电话 */
  encodePhone: string
  /** 手机后四位 */
  code: string
}
export function phoneCheck(params: PhoneCheckData) {
  return ilisAxios.get(`rest/sign/phone-check`, { params })
}

/**
 * # 上传文件：免登陆
 * @param {FormData} formData 表单数据
 * @param {File} formData.file 文件
 */
export function fileUploadNoLogin(formData: FormData) {
  return IlisApiHelper.post<Record<string, any>>('rest/sign/photo/upload', formData, setHearders())
}

/**
 * 发送签字验证码
 */
export function sendSignCode(encodePhone: string) {
  return IlisApiHelper.get(`rest/sign/send/sms/code/${encodePhone}`, {}, setHearders())
}

/**
 * 验证签字验证码
 */
export function checkSignCode(encodePhone: string, code: string) {
  return IlisApiHelper.get(`rest/sign/verify/sms/code/${encodePhone}/${code}`, {}, setHearders())
}
