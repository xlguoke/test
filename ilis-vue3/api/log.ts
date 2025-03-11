import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponsePageEntity } from '~/interface/IResponseEntity.ts'

export interface GetProcessLogListParams {
  objectType: number
  objectId: string
  relationQry: boolean
}

/** 日志数据 */
export interface ProcessLogDataItem {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: number
  content: string
  opinion: string
  objectType: string
  objectId: string
  objectSn: string
  sourceClass: string
  sourceMethod: string
  remark: string
}

/** 获取日志 */
export function getProcessLogList(params: GetProcessLogListParams) {
  const formData = new FormData()
  formData.append('objectType', String(params.objectType))
  formData.append('objectId', params.objectId)
  formData.append('relationQry', String(params.relationQry))

  return IlisApiHelper.post<IResponsePageEntity<ProcessLogDataItem>>('tSLogProcessController.do?getProcessLogList', formData)
}
