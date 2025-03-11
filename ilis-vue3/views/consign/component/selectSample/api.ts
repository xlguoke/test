import { Modal } from 'ant-design-vue'
import type { AxiosResponse } from 'axios'
import type { TestOtherInfoItem } from './modules/UseTestOtherInfo'
import type { AddAdditionalFeeEntity } from './modules/UseAdditionalFee'
import { ILISHTTPError } from '~/types'
import type { ParamPackDetailEntity, ParamPackItem } from '~/views/consign/component/selectSample/modules/UseParamPack.ts'
import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'
import type { QualificationEntity } from '~/views/consign/component/selectSample/interface/Qualification.ts'

// 错误提示
function modalError(msg: string, title?: string) {
  Modal.error({
    title: title || '提示',
    content: msg,
    centered: true,
    okText: '确定',
  })
}

/** 将对象转为formData对象 */
const convertObj2FormData = function (obj: any) {
  const formData = new FormData()

  for (const key in obj) {
    formData.append(key, obj[key])
  }

  return formData
}

const encodeQueryParams = function (params: any) {
  const encodedParams = []
  for (const key in params) {
    encodedParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  }
  return encodedParams
}

export interface BaseRequestParams {
  /** 试验检测项目id */
  testItemIds?: string
  /** 样品id */
  sampleId?: string
}

/**
 * ## 获取收样要求
 */
export function getRequirements(data: BaseRequestParams) {
  return ilisAxios.get('testParamController.do?getRequirements', {
    params: data,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 获取收样辅助信息
 */
export function getTestOtherInfo(data: BaseRequestParams): Promise<AxiosResponse<TestOtherInfoItem[]>> {
  return ilisAxios.get('testParamController.do?getTestOtherInfo', {
    params: data,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 获取附加费用列表
 */
export function getAdditionalFees(data: { testParamIds: string }) {
  return ilisAxios.get('additionalFeeController.do?getAdditionalFees', {
    params: data,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 新增附加费用
 */
export function additionalFeesAdd(data: AddAdditionalFeeEntity) {
  return ilisAxios.post('additionalFeeController.do?doAdd', convertObj2FormData(data)).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 新增附加费用
 */
export function additionalFeesDel(id: string) {
  return ilisAxios.get('additionalFeeController.do?doDel', {
    params: { id },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

interface getQrCodeEntity {
  businessType: string
  businessId: string
  parentKey: string
}

/**
 * ## 获取主码
 */
export function getQrCode(params: getQrCodeEntity) {
  return ilisAxios.get(`/rest/attachmentQR/getQrCode/${params.businessType}`, {
    params: {
      businessId: params.businessId,
      parentKey: params.parentKey,
    },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

interface getAttachmentsEntity {
  parentKey: string
  recursion: boolean
}
/**
 * 获取附件
 */
export function getAttachments(params: getAttachmentsEntity) {
  return ilisAxios.get(`/rest/attachmentQR/attachments/${params.parentKey}`, {
    params: {
      recursion: params.recursion,
    },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

interface getParamPacksEntity {
  pagination: boolean
  sampleId: string
  categoryId: string
}
/**
 * 获取参数打包列表
 */
export function getParamPacks(params: getParamPacksEntity): Promise<AxiosResponse<ParamPackItem[]>> {
  return ilisAxios.get(`/rest/param-packs`, {
    params,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 获取参数打包详情
 */
export function getParamPackDetail(id: string): Promise<AxiosResponse<ParamPackDetailEntity>> {
  return ilisAxios.get(`/rest/param-pack/${id}`).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 获取参数的默认资质
 */
export function getDefaultQualification(paramIds: string) {
  return ilisAxios.get(`rest/testParamController/qualification`, {
    params: { paramIds },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 生成样品编号
 */
export function generateObjectsCode(params: any) {
  const encodeParams = encodeQueryParams(params)
  const url = `rest/consignController/generateObjectsCode?${encodeParams.join('&')}`

  return ilisAxios.get(url).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 生成来样编号
 */
export function generateProvideToCustomerSampleCode(params: any) {
  const encodeParams = encodeQueryParams(params)
  const url = `rest/consignController/generateProvideToCustomerSampleCode?${encodeParams.join('&')}`

  return ilisAxios.get(url).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 获取系统分类（字典）
 */
export function getSysTypeList(typegroupid: string) {
  return ilisAxios.get(`systemController.do?typeGrid`, {
    params: {
      typegroupid,
      field: 'id,typename,typecode,sourceFrom',
    },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

interface QuoteNewestStandardParams {
  paramId: string
  sampleId: string
}
/**
 * 引用最新规程
 */
export function quoteNewestStandard(params: QuoteNewestStandardParams) {
  return ilisAxios.get('/rest/standard/quote-newest-standard', {
    params,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

export interface ParamStandardUseParams extends QuoteNewestStandardParams {
  standards: Array<{
    clauseCode?: string
    executeDate?: number
    expireDate?: number
    id: string
    publishCode?: string
    standardId?: string
    standardName?: string
    type?: string
    uniqKey?: string
  }>
}
/**
 * 引用最新规程
 */
export function paramStandardUse(data: ParamStandardUseParams[]) {
  return ilisAxios.post('/rest/standard/param-standard-use', data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 获取样品描述下拉
 * app\views\testDetection\component\sampleInfo\components\SampleForm.vue 有调用
 */
export function getDescriptionOptions(sampleId: string) {
  return ilisAxios.get('/rest/sample/description', {
    params: { sampleId },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

interface GetDiscriptionHistoryParams {
  testUnitTestSampleId: string
  paramIds: string
}

/**
 * 获取样品描述下拉（历史记录）
 * app\views\testDetection\component\sampleInfo\components\SampleForm.vue 有调用
 */
export function getDiscriptionHistory(data: GetDiscriptionHistoryParams) {
  return ilisAxios.post('testSampleController.do?getDiscriptionHistory', convertObj2FormData(data)).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

export interface ParsCodesToStringParam {
  'sampleAmount': number
  'paramIds[0]'?: string
  'snCategory': string
  'qualificationTypeId': string
  'projectId': string
  'checkTypeId': string
  'testType': string
  // 样品编号
  'testObjectCodes'?: string
  // 来样编号
  'provideToCustomerSampleCodes'?: string
}
/**
 * 格式化样品编号
 */
export function parsCodesToString(params: ParsCodesToStringParam) {
  const encodeParams = encodeQueryParams(params)
  const url = `rest/consignController/parsCodesToString?${encodeParams.join('&')}`

  return ilisAxios.get(url).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 格式化样品编号
 */
export function parsCodesToProvideToCustomerSampleString(params: ParsCodesToStringParam) {
  const encodeParams = encodeQueryParams(params)
  const url = `rest/consignController/parsCodesToProvideToCustomerSampleString?${encodeParams.join('&')}`

  return ilisAxios.get(url).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

export interface EditCodesParam {
  'sampleAmount': number
  'paramIds[0]'?: string
  'snCategory': string
  'qualificationTypeId': string
  'projectId': string
  'checkTypeId': string
  'consignDate': string
  'testType': string
  // 样品编号
  'testObjectCodes'?: string
  // 来样编号
  'provideToCustomerSampleCodes'?: string
}
/**
 * 变更检测组数时重新获取编号
 */
export function editCodes(params: EditCodesParam) {
  const encodeParams = encodeQueryParams(params)
  const url = `rest/consignController/editCodes?${encodeParams.join('&')}`

  return ilisAxios.get(url).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 根据id获取样品大类
 */
export function getCategoryById(id: string) {
  return ilisAxios.get('bigCategoryController.do?getById', {
    params: { id },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 获取单位样品信息
 */
export function getUnitSample(sampleId: string) {
  return ilisAxios.get('testSampleController/getUnitSample.do', {
    params: { sampleId },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

interface GetComboTreeSyncParams {
  page: number
  size: number
  queryParam?: string
  queryType: string
}

/**
 * 获取单位样品信息
 */
export function getComboTreeSync(params: GetComboTreeSyncParams) {
  return ilisAxios.get('bigCategoryController.do?comboTreeSync', {
    params,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

interface GetLastSamplingByConsignUnitParams {
  cosnignUnitId: string
  projectId: string
}

/**
 * 获取单位样品信息
 */
export function getLastSamplingByConsignUnit(params: GetLastSamplingByConsignUnitParams) {
  return ilisAxios.get('testSampleController.do?getLastSamplingByConsignUnit', {
    params,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * 获取样品资质
 */
export function getQualification() {
  return IlisApiHelper.get<QualificationEntity[]>('rest/common-body/qualification/list')
}

interface CheckQualificationUltraEntity {
  paramIds: string
  quaIds: string
}

/**
 * 获取样品资质
 */
export function checkQualificationUltra(data: CheckQualificationUltraEntity) {
  return IlisApiHelper.get<string>('rest/qualificationController/ultra', data)
}

/**
 * 获取参数资质
 */
export function getQualificationByTestParams(paramIds: string) {
  return IlisApiHelper.get<any>('rest/testParamController/qualification', { paramIds })
}

/**
 * 通过uniqueKey查询规程信息
 */
export function getMapByUniqueKey(uniqueKeys: string[]) {
  let url = 'rest/standard/map-by-unique-key'
  uniqueKeys.forEach((item, index) => {
    url += `${index === 0 ? '?' : '&'}uniqueKeys=${encodeURIComponent(item)}`
  })

  return IlisApiHelper.get<{ key: any }>(url)
}
