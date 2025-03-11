import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseCommonEntity } from '~/interface/IResponseEntity.ts'

export interface HumitureLedgerDetailRecordItem {
  id: '4028b242931eebdf01931ef8d8490000'
  temStatus: 'OVER'
  humStatus: 'OVER'
  type: 'MANUAL'
  recordDate: 1707717422000
  tem: 21.0
  hum: 52.0
  laboratoryId: '2c9120818ab58877018ab5b51bc20026'
  laboratoryName: 'xx室内'
  minTem: 10.0
  maxTem: 23.0
  minHum: 50.0
  maxHum: 75.0
  standardTem: '10.0~23.0'
  standardHum: '50.0~75.0'
  status: null
}

export interface HumitureLedgerDetailEntity {
  id: '4028b24293233d350193235a34d50022'
  laboratoryName: 'xx室内xx室内' // 功能室
  ledgerSn: '2024-11-0001' // 台账编号
  name: '9981' // 台账名称
  ledgerStartDate: 1707667200000// 开始时间
  ledgerEndDate: 1726156800000// 结束时间
  status: '10' // 状态
  recordList: HumitureLedgerDetailRecordItem[]
}

/** 巡查列表 */
export function getHumitureLedgerDetail(id: string) {
  return IlisApiHelper.get<IResponseCommonEntity<HumitureLedgerDetailEntity>>(`rest/humiture/ledger/${id}`)
}
