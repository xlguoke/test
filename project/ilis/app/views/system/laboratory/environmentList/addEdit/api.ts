import { IlisApiHelper } from '~/utils/IlisApiHelper'
/**
 * 获取任务检测对象
 * @param testTaskId 任务id
 */
export function getTaskTestObject(testTaskId: string) {
  return IlisApiHelper.get<any>(`testTaskController/getTestObject.do?testTaskId=${testTaskId}`) // todo
}
