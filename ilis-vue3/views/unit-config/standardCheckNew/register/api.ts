import { Modal } from 'ant-design-vue'
import type { StandardCheckNewRegisterEntity } from './listEntity'
import type { DATA_FROM } from './components/waitCheckNewStandard'
import type { CHECKNEW_RECORD_STATUS } from './components/checkNewResult'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { STANDARD_TYPE } from '~/types/standard'

export function modalError(msg: string, title?: string) {
  Modal.error({
    title: title || '提示',
    content: msg,
    centered: true,
    okText: '确定',
  })
}

type Key = string | number

interface CustomValues {
  customColumnId: string
  customColumnName: string
  customColumnValue: string
}

/**
 * 查新登记分页列表
 */
export interface RecordListParam {
  q?: string
  sort?: string
  order?: string
  /** 规程查新id */
  standardCheckNewId?: string
  /** 规程类型 */
  standardType?: STANDARD_TYPE
  /** 状态 */
  status?: string
  /** 查新日期 */
  checkDate?: string
  /** 更新后的规程执行日期 */
  newStandardExecuteDate?: string
}
export function recordListApi(params: RecordListParam) {
  return IlisApiHelper.get<any>('rest/standard/check/new/detail-pagination', params)
}

/** 查新登记详情 */
export function registerDetailApi(id: string) {
  return IlisApiHelper.get<any>(`rest/standard/check/new/detail/${id}`)
}

/**
 * 新增查新登记
 */
export interface SaveRegisterParam {
  id?: string
  /** 规程查新id */
  standardCheckNewId: string
  /** 规程ID(t_s_base_standard) */
  standardId?: string
  /** 规程唯一标识 */
  standardUniqueKey?: string
  /** 更新后的规程唯一标识 */
  newStandardUniqueKey?: string
  /** 规程名称 */
  standardName: string
  /** 规程颁布号 */
  standardPublishCode: string
  /** 规程类型 */
  standardType: STANDARD_TYPE
  /** 查新状态 */
  status: CHECKNEW_RECORD_STATUS
  /** 更新后的规程名称 */
  newStandardName: string
  /** 更新后的规程颁布号 */
  newStandardPublishCode: string
  /** 更新后的规程发布日期 */
  newStandardPublishDate: string
  /** 更新后的规程执行日期 */
  newStandardExecuteDate: string
  /** 查新日期 */
  checkDate: string
  /** 查新人 */
  checkUser: string
  /** 自定义列 */
  customValues: Array<CustomValues>
}
export function saveApi(data: SaveRegisterParam) {
  return IlisApiHelper.put<any>('rest/standard/check/new/register', data)
}

/**
 * 删除数据
 */
export function deleteApi(data: StandardCheckNewRegisterEntity[]) {
  return IlisApiHelper.put<any>('rest/standard/check/new/delete-detail', data.map(d => d.id))
}

/**
 * 待查新规程
 */
interface WaitCheckNewStandardListParam {
  q?: string
  sort?: string
  order?: string
  /** 规程查新ID */
  checkNewId: string
  /** 规程分组id */
  standardTypeId?: string
  /** 是否为本单位规程 */
  whetherThisUnit?: string
}
export function waitCheckNewStandardList(params: WaitCheckNewStandardListParam) {
  return IlisApiHelper.get<any>('rest/standard/check/new/select-standard-locally', params)
}

/**
 * 待查新规程 —— 引用系统规程
 */
export function waitCheckNewStandardListHitekCenter(params: WaitCheckNewStandardListParam) {
  return IlisApiHelper.get<any>('rest/standard/check/new/select-hitek-center-check-new', params)
}

/**
 * 待查新规程 —— 引用数据中心查询结果
 */
interface QuoteQueryResultHitekCenterParam {
  sort?: string
  order?: string
  /** 规程类型 */
  standardType?: string
  /** 查新状态 */
  status?: CHECKNEW_RECORD_STATUS
  /** 规程查新id */
  standardCheckNewId?: string
  /** 查新日期 */
  checkDate?: string
  /** 更新后的规程执行日期 */
  newStandardExecuteDate?: string
}
export function quoteQueryResultHitekCenterApi(params: QuoteQueryResultHitekCenterParam) {
  return IlisApiHelper.get<any>(`rest/standard/check/new/introduce-query/hitekCenter`, params)
}

/**
 * 待查新规程 —— 引用本地查询结果
 */
interface QuoteQueryResultParam {
  sort?: string
  order?: string
  standardTypeId?: string
  whetherThisUnit?: string
  checkNewId?: string
}
export function quoteQueryResultApi(params: QuoteQueryResultParam) {
  return IlisApiHelper.get<any>(`rest/standard/check/new/introduce-query/local`, params)
}

/**
 * 待查新规程 —— 引用选中结果
 */
export function quoteSelResultApi(dataFrom: DATA_FROM, data: Key[], checkNewId?: string) {
  return IlisApiHelper.post<any>(`rest/standard/check/new/introduce-selected/${dataFrom}/${checkNewId}`, data)
}

/**
 * 标记无刷新
 */
export function markNotRefresh(data: Key[]) {
  return IlisApiHelper.put<any>('rest/standard/check/new/mark-not-required', data)
}

/**
 * 导入查新结果
 */
export function importCheckNewResultApi(checkNewId: string, file: File) {
  return IlisApiHelper.postForm<any>(`rest/standard/check/new/import-register/${checkNewId}`, {
    file,
  })
}

/**
 * 导出列表数据
 */
export function exportRegisterListApi(params: RecordListParam) {
  const paramStr = new URLSearchParams(params as any)
  window.open(`/ilis2/rest/standard/check/new/detail-export?${paramStr}`, '_blank')
}

/**
 * 提交审核前，检测数据状态
 */
export function boforeAuditSubmitCheck(checkNewId: string) {
  return IlisApiHelper.get<any>(`rest/standard/check/new/prepare/submit/${checkNewId}`)
}

/**
 * 同步查新记录
 */
export function pullCheckNewRecord() {
  return IlisApiHelper.get<any>(`rest/standard/check/new/hitek-center-record-pull`)
}
