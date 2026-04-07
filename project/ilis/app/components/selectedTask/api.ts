import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface TaskData {
  id: string
  testTaskCode: string
  testRecordCode: string
  projectCode?: string
  sampleDisplayName: string
  testDate?: number
  testEndDate?: number
  testPersons: string
  unitName: string
  projectName: string
  projectId: string
  qualificationTypeId?: string
}

interface QueryParam {
  /** 模糊查询 */
  quickQryParam?: string
  /** 状态 */
  testTaskStatus?: number
  /** 检测人员 */
  testPersons?: string
}

export function getPageListApi(params: QueryParam) {
  return IlisApiHelper.postForm<{ rows: TaskData[] }>(`reportCreateController.do?getTaskWithUnitAndProject`, params)
}
