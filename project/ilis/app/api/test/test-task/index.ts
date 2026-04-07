import type { TestTaskDetailDTO, TestTaskListItemDTO, TestTaskParamListItemDTO, TestTaskPerson } from './types'
import type { IResponseCommonEntity, IResponseOldRowsEntity, IResponsePageEntity } from '~/interface/IResponseEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 获取检测任务列表 */
export function getTestTaskList(params: Record<string, any>) {
  return IlisApiHelper.post<IResponsePageEntity<TestTaskListItemDTO>>('testTaskController.do?datagrid', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

/** 获取检测任务详情 */
export function getTestTaskDetail(id: string) {
  return IlisApiHelper.get<TestTaskDetailDTO>('testTaskController.do?getTestTaskDetail', { id })
}

/** 获取检测任务参数 */
export function getTestTaskParamList(testTaskId: string) {
  return IlisApiHelper.get<IResponseOldRowsEntity<TestTaskParamListItemDTO[]>>('testTaskController.do?getTestTaskParams', { testTaskId })
}

/** 获取试验任务人员 */
export function getTestTaskPerson(testTaskId: string) {
  return IlisApiHelper.get<IResponseCommonEntity<TestTaskPerson[]>>(`rest/task/person/by-task/${testTaskId}`)
}
