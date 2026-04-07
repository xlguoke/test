import type { IAppointmentContractDTO, IConsignConstructReqDTO, IConsignConstructResDTO, IConsignDataDTO, IExtractSampleDTO, IFeeDTO, IMailInfoDTO } from './types'
import type { IOverQualificationCheckParam } from '~/views/consign/consignDetail/interface'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export * from './enum'

/** 获取委托详情以及构造参数(原通过表达式注入jsp页面的数据) */
export function consignConstructParamsApi(param: IConsignConstructReqDTO) {
  return IlisApiHelper.get<IConsignConstructResDTO>(`rest/consignController/detail/getConstructParams`, param)
}

/** 保存委托详情 */
export function saveConsignDetailApi(data: IConsignDataDTO) {
  return IlisApiHelper.post<any>('rest/consign/save', data)
}

/** 修改工程项目后更新委托信息 */
export function updateConsignInfoApi(consignId: string) {
  return IlisApiHelper.postForm('consignController/updateConsignInfo.do', { id: consignId })
}

/** 判断是否使用了此类的编号项 */
export function checkIsUsedTremCodeApi(termType: string) {
  return IlisApiHelper.get<any>(`systemController/checkUseSnTerm.do?type=${termType}`)
}

/** 获取单位工程 */
export function getUnitProjectApi(param: { id: string, type?: number, levelCode?: string }) {
  return IlisApiHelper.get<any>(`rest/synthesis/nav/tree`, param)
}

/** 获取邮寄信息 */
export function getMailInfoApi(postId?: string) {
  return IlisApiHelper.get<{ rows: IMailInfoDTO[] }>(`rest/post/list?postId=${postId || ''}`)
}

/** 样品资质验证 */
export function validateQualificationApi(param: { paramIds: string, quaIds: string }) {
  return IlisApiHelper.get<string>(`rest/qualificationController/ultra`, param)
}

/** 获取关联检测合同 */
export function appointmentContractApi(param: { consignUnitId: string, projectId: string }) {
  return IlisApiHelper.postForm<IAppointmentContractDTO[]>(`consignController.do?appointmentContracts`, param)
}

interface SynthesisDefaultPersonParam {
  paramIds: string
  projectId?: string
  contractId?: string
  synthesisType?: string
}
/** 创建综合试验 - 获取默认人员 */
export function synthesisDefaultPersonApi(param: SynthesisDefaultPersonParam) {
  return IlisApiHelper.get<any>(`rest/synthesis/checkDefaultPerson`, param)
}

/** 创建综合试验 - 复制报告：获取已设置的检测人员 */
export function synthesisTaskPersonApi(param: { id: string }) {
  return IlisApiHelper.get<any>(`rest/synthesis/testTaskPerson`, param)
}

/**  创建综合试验 - 获取创建进度 */
export function synthesisTestCreateProgressApi(consignId: string) {
  return IlisApiHelper.get<any>(`synthesisTestTaskController.do?getSynthesisTestCreateProgress`, { consignId })
}

/** 创建委托编号 */
export function createConsignNoApi(consignId: string) {
  return IlisApiHelper.get<any>(`consignController.do?useSnImmediately`, { consignId })
}

/** 完成委托超资验证 */
export function overQualificationApi(data: IOverQualificationCheckParam) {
  return IlisApiHelper.post<any>(`rest/qualificationController/over-qualification/warn`, data)
}

/** 费用标准 */
export function feeStandardApi() {
  return IlisApiHelper.get<any[]>(`rest/param-price/param-version-enabled-standards`)
}

/** 获取可用费用合同 */
export function useableContractApi(data: { unitId: string, testParamIds: string, projectId: string }) {
  return IlisApiHelper.postForm<{ obj: IAppointmentContractDTO[], success: boolean }>(`feeContractMainController.do?getUseableContract`, data)
}

/** 获取合同里的参数价格等信息 */
export function getContractParamsApi(contractId: string) {
  return IlisApiHelper.get<any>(`rest/fee/model/contract/params`, { contractId })
}

/** 提交计算费用 */
export function feeCumputeApi(data: any) {
  return IlisApiHelper.post<any>(`rest/fee/compute`, data)
}

/** 获取委托费用信息 */
export function consignFeeApi(consignId: string) {
  return IlisApiHelper.get<IFeeDTO>(`rest/fee/model/${consignId}`)
}

/** 获取计费调整添加的辅助费用 */
export function adjustAuxiliaryFeeApi(consignId: string) {
  return IlisApiHelper.get<any[]>(`rest/fee/model/custom/${consignId}`)
}

/** 根据指定参数id和收费标准id获取收样参数， paramIds多个用逗号分隔 */
export function specifiedTestParamsApi(data: { sampleId: string, paramIds: string, priceStandardId: string }) {
  return IlisApiHelper.get<any>(`testParamController.do?getSpecifiedTestParams`, data)
}

/** 检查当前信用余额是否足够支付委托费用（含退回委托的已支付费用计算） */
export async function checkCreditApi(data: { consignUnitId: string, consignId: string, feeTotal: number }) {
  return IlisApiHelper.postForm<any>(`consignController.do?checkConsignCreditBalance`, data)
}

/** 获取预委托平台查看委托单的url */
export async function getPreWebUrlApi() {
  return IlisApiHelper.get<string>(`rest/pre/web`)
}

/** # 获取推送次数 */
export async function getPushTimesApi(consignId: string, preConsignId: string) {
  return IlisApiHelper.get<{ pushCount: number }>(`rest/consignController/aboutPreConsignPdf`, { consignId, preConsignId })
}

/** # 复制委托（指定类型） */
export async function copyConsignApi(consignId: string) {
  return IlisApiHelper.post<any>(`consignController.do?doCopy`, { consignId, determineInspect: true })
}

/** ## 样品状态检查： 已分配或分包的样品不允许删除 */
export function sampleAssignmentsApi(mark: string) {
  return IlisApiHelper.get<any>(`rest/consign/object-assignments/${mark}`)
}

/** ## 删除样品 */
export function deleteSampleApi(data: { mark: string, delete: boolean, opinion: string }) {
  return IlisApiHelper.postForm<any>(`rest/consign/object/${data.mark}/state`, {
    delete: data.delete,
    opinion: data.opinion,
  })
}

/** ## 删除外来样品 */
export function delExternalSampleApi(externalObjectId: string) {
  return IlisApiHelper.delete<any>(`rest/object/external/${externalObjectId}`)
}

/** ## 添加外来样品 */
export function addExternalSampleApi(data: Record<string, any>) {
  return IlisApiHelper.post<{ data: string, code: number }>(`rest/object/external`, data)
}

/** ## 编辑外来样品 */
export function editExternalSampleApi(data: Record<string, any>) {
  return IlisApiHelper.put<string>(`rest/object/external`, data)
}

/** ## 验证完成委托是否自动打印, 返回打印次数 */
export function checkAutoPrintApi() {
  return IlisApiHelper.get<{ printNum: number }>(`consignController/checkAutoPrint.do`)
}

/** ## 检查委托完成后绑定电子标签 */
export function checkBindElectronLabelApi(consignId: string) {
  return IlisApiHelper.get<any>(`rest/sample/rfid/record/${consignId}`)
}

/** ## 获取第三方缴费单位 */
export function getThirdPartyPaymentUnitApi() {
  return IlisApiHelper.get<any>(`consignUnitController.do?goExternalUnitList`)
}

/** ## 获取领域配置的模板类型 */
export function systemPrintTemplateApi(printType: string) {
  return IlisApiHelper.get<any>(`rest/system/print/template?type=${printType}`)
}

/** ## 获取现场取样信息 */
export function getExtractSampleInfo(id: string) {
  return IlisApiHelper.get<IExtractSampleDTO>(`rest/extract/sample/${id}`)
}

export function getExtractSampleOtherInfo(id: string) {
  return IlisApiHelper.get<{
    testObjectId: string | null
    testObjectCode: string | null
    snCategory: string | null
    snCategoryId: string | null
    terms: any | null
  }>(`rest/extract/snInfo/${id}`)
}
