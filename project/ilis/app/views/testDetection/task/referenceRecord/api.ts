import type { IReferenceRecord } from '.'

/**
 * # 获取最新引用记录列表(不分页)
 */
export function getReferenceRecordList(testTaskId: string) {
  return ilisAxios.get<IReferenceRecord[]>('/rest/testTaskController/queryTestParamLastUseEquipment', {
    params: { testTaskId },
  })
}
