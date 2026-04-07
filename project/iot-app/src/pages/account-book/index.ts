import { AnyDictionaryHelper } from '@/utils/AnyDictionaryHelper'
import request from '@/utils/request'

export interface IHumitureLedger {
  ledgerSn: '2024-11-0008'
  name: '222'
  laboratoryName: 'ww测试功能室ww测试功能室'
  ledgerEndDate: 1732204800000
  id: '4028b24293522ada019352d8b130013b'
  createName: '管理员'
  ledgerStartDate: 1732204800000
  status: '20'
  createDate: 1732261753000
}

/** 状态 0正常 1超标 */
export enum StatusType {
  正常 = '0',
  超标 = '1',
}

/** 状态 0正常 1超标 */
export const StatusTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '正常', key: StatusType.正常 },
  { label: '超标', key: StatusType.超标 },
])

/** 巡查台账列表 */
export function getHumitureLedgerList(data: Record<string, any>) {
  return request.get<any>('rest/humiture/ledger/page', {
    params: data,
  })
}

/** 巡查台账详情列表 */
export function getHumitureLedgerDetailList(data: Record<string, any>) {
  return request.get<any>('rest/humiture/ledger/page/details', {
    params: data,
  })
}

/** 巡查台账详情 */
export function getHumitureLedgerDetail(id: string) {
  return request.get<IHumitureLedger>(`rest/humiture/ledger/${id}`)
}
