import type { AxiosResponse } from 'axios'
import type { ArchiveDepositEntity } from './entity/ArchiveDepositEntity'
import type { ArchiveManageListResponse } from './entity/ArchiveManageListResponse'
import type { ArchiveMaterialEntity } from './entity/ArchiveMaterialEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取归档管理列表 - POST 🌐
 * @param params 查询参数
 */
export function getArchiveList(params: {
  page?: number
  rows?: number
  consignProjectId?: string
  quickQryParam?: string
  status?: string
  sort?: string
  order?: string
}): Promise<AxiosResponse<ArchiveManageListResponse>> {
  return IlisApiHelper.postForm('archiveController.do?projectArchiveDatagrid', params)
}

/**
 * # 导出归档数据 - GET 🌐
 * @param params 导出参数
 */
export function exportArchive(params: {
  consignProjectId?: string
  reportIds?: string
  [key: string]: any
}): Promise<AxiosResponse<ArrayBuffer>> {
  return IlisApiHelper.postForm('/archiveController.do?projectArchiveExportXls', params, {
    responseType: 'arraybuffer',
  })
}

/**
 * # 获取系统业务参数 - GET 🌐
 * @param key 参数键
 */
export function getBusinessParam(key: string): Promise<AxiosResponse<string>> {
  return IlisApiHelper.get('tSBusinessParamController.do?getBusinessParam', { key })
}

/**
 * # 获取归档资料列表 API 🌐
 * @param params 查询参数
 */
export function getArchiveDataList(params: any) {
  return IlisApiHelper.get('archiveSiteController.do?goArchiveDataPage', params)
}

/**
 * # 获取归档地址列表 API 🌐
 * @param params 查询参数
 */
export function getArchiveSiteList(params: any) {
  return IlisApiHelper.get<any>('archiveSiteController.do?datagrid', params)
}

/**
 * # 获取所有归档资料 - GET 🌐
 * 用于归档页面顶部资料选择区域
 */
export function getArchiveMaterialAll(): Promise<AxiosResponse<{ success: boolean, obj: ArchiveMaterialEntity[] }>> {
  return IlisApiHelper.get('archiveMaterialController/getMaterialAll.do')
}

/**
 * # 获取报告关联的待归档数据 - GET 🌐
 * @param reportIds 报告ID列表
 */
export function getWaitForArchiveList(reportIds: string): Promise<AxiosResponse<{ success: boolean, obj: any[] }>> {
  return IlisApiHelper.get('archiveController.do?getWaitForArchiveList', { reportIds })
}

/**
 * # 获取归档详情 - GET 🌐
 * @param reportId 报告ID
 */
export function getReportArchiveDetail(reportId: string): Promise<AxiosResponse<{ success: boolean, obj: ArchiveDepositEntity[] }>> {
  return IlisApiHelper.get('archiveController.do?getReportArchiveDetail', { reportId })
}

/**
 * # 批量保存归档 - POST 🌐
 * @param archiveList 归档数据列表
 */
export function batchSaveArchive(archiveList: ArchiveDepositEntity[]): Promise<AxiosResponse<{ success: boolean, msg: string }>> {
  return IlisApiHelper.postForm('archiveController.do?batchSaveArchive', {
    archiveListStr: JSON.stringify(archiveList),
  })
}

/**
 * # 删除归档 - POST 🌐
 * @param archiveId 归档ID
 */
export function delArchiveById(archiveId: string): Promise<AxiosResponse<{ success: boolean, msg: string }>> {
  return IlisApiHelper.postForm('archiveController.do?delArchiveById', { archiveId })
}

/**
 * # 保存归档资料关联关系 - POST 🌐
 * @param reportIds 报告ID列表
 * @param archiveMaterialIds 归档资料ID列表
 */
export function saveArchiveMaterialRelation(reportIds: string, archiveMaterialIds: string[]): Promise<AxiosResponse<{ success: boolean, msg: string }>> {
  return IlisApiHelper.postForm('archiveMaterialController.do?saveArchiveMaterialRelation', {
    reportIds,
    archiveMaterialIds: archiveMaterialIds.join(','),
  })
}

/**
 * # 获取归档资料关联关系 - GET 🌐
 * @param reportId 报告ID
 */
export function getArchiveMaterialRelation(reportId: string): Promise<AxiosResponse<{ success: boolean, obj: any[] }>> {
  return IlisApiHelper.get('archiveMaterialController.do?getArchiveMaterialRelation', { reportId })
}

/**
 * 撤销归档 - POST 🌐
 * @param reportId 报告ID
 */
export function revokeArchiveById(reportId: string): Promise<AxiosResponse<{ success: boolean, msg: string }>> {
  return IlisApiHelper.postForm(`/archiveController/recall/${reportId}`)
}
