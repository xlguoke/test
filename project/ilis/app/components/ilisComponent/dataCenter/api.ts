import type { DataCenterEntity } from './DataCenterEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface IDataCenterForDebugModalParam {
  /** # 传入后直接展示，不再通过接口查询 */
  tableData?: DataCenterEntity[]
  consignId?: string
  testObjectId?: string
  testTaskId?: string
  reportId?: string
}
export async function getDataCenterForDebugData(params: IDataCenterForDebugModalParam) {
  return IlisApiHelper.get<DataCenterEntity[]>('rest/datacenter-query/all-datacenter-ids', params)
}
